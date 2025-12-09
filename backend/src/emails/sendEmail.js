// src/emails/sendEmail.js
import nodemailer from "nodemailer";
import SibApiV3Sdk from "sib-api-v3-sdk";
import ENV from "../ENV.js";
import {
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
} from "./emailTemplates.js";

let smtpTransporter = null;
const getSmtpTransporter = () => {
  if (smtpTransporter) return smtpTransporter;

  if (!ENV.USE_SMTP || ENV.USE_SMTP === "false") return null;

  const host = ENV.SMTP_HOST || ENV.BREVO_SMTP_HOST || "smtp-relay.brevo.com";
  const port = Number(ENV.SMTP_PORT || ENV.BREVO_SMTP_PORT || 587);
  smtpTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user: (ENV.SMTP_USER || ENV.BREVO_SMTP_USER || "").trim(),
      pass: (ENV.SMTP_PASS || ENV.BREVO_SMTP_PASS || "").trim(),
    },
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 20000,
  });

  smtpTransporter.verify()
    .then(() => console.log("SMTP transporter verified"))
    .catch((err) => console.warn("SMTP transporter verify failed:", err.message || err));

  return smtpTransporter;
};

let brevoClientInitialized = false;
const initBrevoClient = () => {
  if (!ENV.BREVO_API_KEY) return false;
  if (brevoClientInitialized) return true;

  try {
    SibApiV3Sdk.ApiClient.instance.authentications["api-key"].apiKey = ENV.BREVO_API_KEY;
    brevoClientInitialized = true;
    console.log("Brevo API client initialized");
    return true;
  } catch (err) {
    console.error("Failed to init Brevo client:", err);
    return false;
  }
};

/* -------------------------
   Low-level senders
   ------------------------- */

const sendViaBrevo = async ({ to, subject, html, senderName, senderEmail }) => {
  if (!initBrevoClient()) {
    throw new Error("BREVO_API_KEY not configured");
  }

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  const sendSmtpEmail = {
    sender: { email: senderEmail || ENV.BREVO_FROM_EMAIL || ENV.EMAIL_SENDER, name: senderName || "ConvoX" },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  };

  // sendTransacEmail returns a Promise
  const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
  return result;
};

const sendViaSmtp = async ({ to, subject, html, senderName, senderEmail }) => {
  const transporter = getSmtpTransporter();
  if (!transporter) {
    throw new Error("SMTP is not enabled or transporter could not be created");
  }

  const mailOptions = {
    from: `"${senderName || "ConvoX"}" <${(senderEmail || ENV.EMAIL_SENDER).trim()}>`,
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

/* -------------------------
   Public wrapper
   - chooses Brevo API first (if key present), else SMTP if enabled
   - returns { ok, info, error }
   ------------------------- */

export const sendEmail = async ({ to, subject, html, senderName, senderEmail }) => {
  // prefer Brevo API on Render / production
  if (ENV.BREVO_API_KEY) {
    try {
      const info = await sendViaBrevo({ to, subject, html, senderName, senderEmail });
      console.log("Email sent via Brevo API:", info);
      return { ok: true, info };
    } catch (err) {
      console.error("Brevo API send failed:", err?.response || err?.body || err?.message || err);
      // fallback to SMTP if configured
      if (ENV.USE_SMTP && (ENV.SMTP_USER || ENV.BREVO_SMTP_USER)) {
        console.log("Falling back to SMTP because Brevo API failed");
        try {
          const info = await sendViaSmtp({ to, subject, html, senderName, senderEmail });
          console.log("Email sent via SMTP (fallback):", info);
          return { ok: true, info };
        } catch (smtpErr) {
          console.error("Fallback SMTP send also failed:", smtpErr);
          return { ok: false, error: smtpErr };
        }
      }
      return { ok: false, error: err };
    }
  }

  // If no BREVO_API_KEY, try SMTP (useful for local dev)
  if (ENV.USE_SMTP && (ENV.SMTP_USER || ENV.BREVO_SMTP_USER)) {
    try {
      const info = await sendViaSmtp({ to, subject, html, senderName, senderEmail });
      console.log("Email sent via SMTP:", info);
      return { ok: true, info };
    } catch (err) {
      console.error("SMTP send failed:", err);
      return { ok: false, error: err };
    }
  }

  const err = new Error("No email provider configured. Set BREVO_API_KEY or enable SMTP.");
  console.error(err);
  return { ok: false, error: err };
};

/* -------------------------
   High-level helpers (your exported functions)
   - They call sendEmail and DO NOT throw.
   - They return the send result so caller can inspect if desired.
   ------------------------- */

export const sendVerificationEmail = async ({ to, subject = "Verify Your Email", ver }) => {
  const html = VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", ver);
  try {
    const res = await sendEmail({
      to,
      subject,
      html,
      senderName: "ConvoX",
      senderEmail: ENV.BREVO_FROM_EMAIL || ENV.EMAIL_SENDER,
    });
    if (!res.ok) console.warn("Failed to send verification email:", res.error);
    return res;
  } catch (err) {
    console.error("Unexpected error in sendVerificationEmail:", err);
    return { ok: false, error: err };
  }
};

export const sendWelcomeEmail = async ({ to, subject = "Welcome to ConvoX", name, url }) => {
  const html = WELCOME_EMAIL_TEMPLATE.replace("{Name}", name).replace("{dashboardLink}", url);
  try {
    const res = await sendEmail({
      to,
      subject,
      html,
      senderName: "ConvoX",
      senderEmail: ENV.BREVO_FROM_EMAIL || ENV.EMAIL_SENDER,
    });
    if (!res.ok) console.warn("Failed to send welcome email:", res.error);
    return res;
  } catch (err) {
    console.error("Unexpected error in sendWelcomeEmail:", err);
    return { ok: false, error: err };
  }
};

export const sendPasswordResetEmail = async ({ to, subject = "Reset your password", resetToken }) => {
  const html = PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", `${ENV.CLIENT_URL}/reset-password/${resetToken}`);
  try {
    const res = await sendEmail({
      to,
      subject,
      html,
      senderName: "ConvoX",
      senderEmail: ENV.BREVO_FROM_EMAIL || ENV.EMAIL_SENDER,
    });
    if (!res.ok) console.warn("Failed to send password reset email:", res.error);
    return res;
  } catch (err) {
    console.error("Unexpected error in sendPasswordResetEmail:", err);
    return { ok: false, error: err };
  }
};

export const sendPasswordRestSuccess = async ({ to, subject = "Password reset successful" }) => {
  const html = PASSWORD_RESET_SUCCESS_TEMPLATE;
  try {
    const res = await sendEmail({
      to,
      subject,
      html,
      senderName: "ConvoX",
      senderEmail: ENV.BREVO_FROM_EMAIL || ENV.EMAIL_SENDER,
    });
    if (!res.ok) console.warn("Failed to send password reset success email:", res.error);
    return res;
  } catch (err) {
    console.error("Unexpected error in sendPasswordRestSuccess:", err);
    return { ok: false, error: err };
  }
};
