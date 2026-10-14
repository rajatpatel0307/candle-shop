import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';

function hasSmtpConfig() {
  return Boolean(env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASSWORD);
}

function createTransporter() {
  if (!hasSmtpConfig()) return null;
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
  });
}

async function sendMail({ to, subject, text }) {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn(`[mail disabled] ${subject} for ${to}: ${text}`);
    return;
  }
  await transporter.sendMail({ from: env.EMAIL_FROM, to, subject, text });
}

export async function sendVerificationEmail(user, otp) {
  await sendMail({
    to: user.email,
    subject: 'Your Candle Commerce verification code',
    text: `Your Candle Commerce verification code is ${otp}. This code expires soon.`,
  });
}

export async function sendPasswordResetEmail(user, token) {
  const url = `${env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;
  await sendMail({
    to: user.email,
    subject: 'Reset your Candle Commerce password',
    text: `Reset your password: ${url}`,
  });
}
