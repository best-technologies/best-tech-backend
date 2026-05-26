import {
  EmailProviderName,
  EmailSendResult,
  OutboundEmail,
} from './email.types';
import { canUseGmailProvider, sendViaGmail } from './email-providers/gmail.provider';
import {
  canUseResendProvider,
  sendViaResend,
} from './email-providers/resend.provider';

const PROVIDER_HANDLERS: Record<
  EmailProviderName,
  {
    isConfigured: () => boolean;
    send: (message: OutboundEmail) => Promise<EmailSendResult>;
  }
> = {
  resend: {
    isConfigured: canUseResendProvider,
    send: sendViaResend,
  },
  gmail: {
    isConfigured: canUseGmailProvider,
    send: sendViaGmail,
  },
};

export function parseEmailProviders(
  value = process.env.EMAIL_PROVIDER,
): EmailProviderName[] {
  if (!value?.trim()) {
    return ['gmail'];
  }

  const providers = value
    .split(',')
    .map((provider) => provider.trim().toLowerCase())
    .filter(
      (provider): provider is EmailProviderName =>
        provider === 'resend' || provider === 'gmail',
    );

  return providers.length > 0 ? providers : ['gmail'];
}

function getProviderErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

export async function deliverEmail(
  message: OutboundEmail,
): Promise<EmailSendResult> {
  const providers = parseEmailProviders();
  const failures: string[] = [];

  for (const provider of providers) {
    const handler = PROVIDER_HANDLERS[provider];

    if (!handler.isConfigured()) {
      failures.push(`${provider}: not configured`);
      continue;
    }

    try {
      const result = await handler.send(message);
      console.log(
        `[Email] Sent via ${result.provider}${result.messageId ? ` (${result.messageId})` : ''}`,
      );
      return result;
    } catch (error) {
      const errorMessage = getProviderErrorMessage(error);
      failures.push(`${provider}: ${errorMessage}`);
      console.error(`[Email] Provider "${provider}" failed:`, error);
    }
  }

  throw new Error(
    `All configured email providers failed. Attempts: ${failures.join(' | ')}`,
  );
}
