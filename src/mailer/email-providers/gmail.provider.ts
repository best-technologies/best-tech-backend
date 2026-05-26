import * as nodemailer from 'nodemailer';
import { OutboundEmail, EmailSendResult } from '../email.types';

function isGmailConfigured(): boolean {
  return Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);
}

export function canUseGmailProvider(): boolean {
  return isGmailConfigured();
}

export async function sendViaGmail(
  message: OutboundEmail,
): Promise<EmailSendResult> {
  if (!isGmailConfigured()) {
    throw new Error('Gmail provider is not configured');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.GOOGLE_SMTP_HOST || 'smtp.gmail.com',
    port: process.env.GOOGLE_SMTP_PORT
      ? parseInt(process.env.GOOGLE_SMTP_PORT, 10)
      : 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const fromName = message.fromName ?? 'Best Technologies Limited';
  const fromAddress = process.env.EMAIL_USER as string;
  const recipients = Array.isArray(message.to) ? message.to : [message.to];

  const result = await transporter.sendMail({
    from: {
      name: fromName,
      address: fromAddress,
    },
    to: recipients.join(', '),
    subject: message.subject,
    html: message.html,
  });

  return {
    provider: 'gmail',
    messageId: result.messageId,
  };
}
