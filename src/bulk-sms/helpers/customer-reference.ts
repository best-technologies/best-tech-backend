import { randomBytes } from 'crypto';

export function generateCustomerReference(prefix: string = 'SMS'): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = randomBytes(6).toString('base64').replace(/[^A-Z0-9]/gi, '').slice(0, 10).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}


