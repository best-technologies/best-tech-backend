export type EmailProviderName = 'resend' | 'gmail';

export interface OutboundEmail {
  to: string | string[];
  subject: string;
  html: string;
  fromName?: string;
}

export interface EmailSendResult {
  provider: EmailProviderName;
  messageId?: string;
}
