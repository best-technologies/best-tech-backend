import { Resend } from 'resend';
import { OutboundEmail, EmailSendResult } from '../email.types';

function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
}

export function canUseResendProvider(): boolean {
  return isResendConfigured();
}

export async function sendViaResend(
  message: OutboundEmail,
): Promise<EmailSendResult> {
  if (!isResendConfigured()) {
    throw new Error('Resend provider is not configured');
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromName = message.fromName ?? 'Best Technologies Limited';
  const fromEmail = process.env.RESEND_FROM_EMAIL as string;
  const recipients = Array.isArray(message.to) ? message.to : [message.to];

  const result = await resend.emails.send({
    from: `${fromName} <${fromEmail}>`,
    to: recipients,
    subject: message.subject,
    html: message.html,
  });

  if (result.error) {
    throw new Error(result.error.message || 'Resend failed to send email');
  }

  return {
    provider: 'resend',
    messageId: result.data?.id,
  };
}
