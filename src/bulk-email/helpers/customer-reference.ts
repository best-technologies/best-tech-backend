import { randomBytes } from 'crypto';

export function generateCustomerReference(): string {
  const timestamp = Date.now().toString(36);
  const random = randomBytes(4).toString('hex');
  return `EMAIL_${timestamp}_${random}`.toUpperCase();
}
