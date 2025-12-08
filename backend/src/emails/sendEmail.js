import nodemailer from "nodemailer";
import ENV from "../ENV.js";
import {
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
} from "./emailTemplates.js";

export const sendVerificationEmail = async ({ to, subject, ver }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: ENV.SMTP_USER,
        pass: ENV.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"ConvoX" <${ENV.EMAIL_SENDER}>`,
      to,
      subject,
      html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", ver),
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (err) {
    console.log("Email send failed:", err);
    throw new Error(err);
  }
};

export const sendWelcomeEmail = async ({ to, subject, name, url }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: ENV.EMAIL_SENDER,
        pass: ENV.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"ConvoX" <${ENV.EMAIL_SENDER}>`,
      to,
      subject,
      html: WELCOME_EMAIL_TEMPLATE.replace("{Name}", name).replace(
        "{dashboardLink}",
        url
      ),
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (err) {
    console.log("Email send failed:", err);
  }
};

export const sendPasswordResetEmail = async ({ to, subject, resetToken }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: ENV.EMAIL_SENDER,
        pass: ENV.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"ConvoX" <${ENV.EMAIL_SENDER}>`,
      to,
      subject,
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace(
        "{resetURL}",
        `${ENV.CLIENT_URL}/reset-password/${resetToken}`
      ),
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (err) {
    console.log("Email send failed:", err);
  }
};

export const sendPasswordRestSuccess = async ({ to, subject }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: ENV.EMAIL_SENDER,
        pass: ENV.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"ConvoX" <${ENV.EMAIL_SENDER}>`,
      to,
      subject,
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (err) {
    console.log("Email send failed:", err);
  }
};
