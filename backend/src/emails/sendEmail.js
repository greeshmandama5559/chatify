// src/emails/sendEmail.js
import nodemailer from 'nodemailer';
import ENV from '../ENV.js';
import {
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
} from './emailTemplates.js';

const createTransporter = () => {
  const host = "smtp.gmail.com";
  const port = 465;
  const user = ENV.SMTP_USER;
  const pass = ENV.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    throw new Error('SMTP config missing. Please set SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASS in ENV.');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
};

export const sendEmail = async ({ to, subject, html, text, fromName }) => {
  try {
    const fromAddr = ENV.EMAIL_SENDER.trim();
    if (!fromAddr) return { ok: false, error: new Error('No sender defined (EMAIL_FROM)') };

    const transporter = createTransporter();

    const fromField = fromName ? `"${fromName}" <${fromAddr}>` : fromAddr;

    const msg = {
      from: fromField,
      to,
      subject,
      text: text || undefined,
      html: html || undefined,
    };

    const info = await transporter.sendMail(msg);
    return { ok: true, info };
  } catch (err) {
    console.error('SMTP send failed:', err);
    return { ok: false, error: err };
  }
};

/* -------------------------
   High-level helpers
   ------------------------- */

export const sendVerificationEmail = async ({ to, subject = 'Verify Your Email', ver }) => {
  const html = VERIFICATION_EMAIL_TEMPLATE.replace('{verificationCode}', ver);
  return sendEmail({ to, subject, html, fromName: 'ConvoX' });
};

export const sendWelcomeEmail = async ({ to, subject = 'Welcome to ConvoX', name, url }) => {
  const html = WELCOME_EMAIL_TEMPLATE.replace('{Name}', name).replace('{dashboardLink}', url);
  return sendEmail({ to, subject, html, fromName: 'ConvoX' });
};

export const sendPasswordResetEmail = async ({ to, subject = 'Reset your password', resetToken }) => {
  const html = PASSWORD_RESET_REQUEST_TEMPLATE.replace('{resetURL}', `${ENV.CLIENT_URL}/reset-password/${resetToken}`);
  return sendEmail({ to, subject, html, fromName: 'ConvoX' });
};

export const sendPasswordRestSuccess = async ({ to, subject = 'Password reset successful' }) => {
  const html = PASSWORD_RESET_SUCCESS_TEMPLATE;
  return sendEmail({ to, subject, html, fromName: 'ConvoX' });
};
