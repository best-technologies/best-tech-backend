# Bulk Email Service Documentation

## Overview

The Bulk Email Service provides a comprehensive solution for sending bulk emails through your NestJS application. It's designed to work seamlessly with Gmail SMTP and provides features similar to your existing bulk SMS service, including cost tracking, tier-based pricing, and delivery status monitoring.

## Features

- ✅ **Bulk Email Sending**: Send emails to multiple recipients simultaneously
- ✅ **Attachment Support**: Include file attachments in your emails
- ✅ **HTML & Plain Text**: Support for both HTML and plain text email content
- ✅ **Cost Tracking**: Track email costs with tier-based pricing
- ✅ **Delivery Status**: Monitor email delivery status (pending, sent, failed, bounced, delivered, opened, clicked)
- ✅ **Email Templates**: Pre-built templates for common email types
- ✅ **Wallet System**: Track email spending and balance
- ✅ **History & Analytics**: View email sending history and statistics
- ✅ **Callback URLs**: Get delivery status updates via webhooks

## Architecture

### Database Models

The service uses the following Prisma models:

- **EmailWallet**: Tracks email spending and balance
- **Email**: Stores email records and delivery status
- **EmailWalletTransaction**: Records all email-related transactions
- **EmailCostTier**: Manages tier-based pricing for emails

### Service Components

- **BulkEmailService**: Core email sending functionality
- **EmailTierService**: Manages pricing tiers
- **BulkEmailController**: REST API endpoints
- **Email Templates**: Reusable HTML email templates

## Setup & Configuration

### 1. Environment Variables

Add the following environment variables to your `.env` file:

```env
# Gmail SMTP Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
GOOGLE_SMTP_HOST=smtp.gmail.com
GOOGLE_SMTP_PORT=587

# Optional: Custom SMTP settings
SMTP_SECURE=false
SMTP_AUTH_USER=your-email@gmail.com
SMTP_AUTH_PASS=your-app-password
```

### 2. Gmail App Password Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password in `EMAIL_PASSWORD`

### 3. Database Migration

Run the Prisma migration to create the email-related tables:

```bash
npx prisma migrate dev --name add-bulk-email-models
npx prisma generate
```

## API Endpoints

### Email Sending

#### Send Bulk Email
```http
POST /bulk-email/send-email
Content-Type: application/json

{
  "from": "sender@example.com",
  "fromName": "Your Company Name",
  "to": "recipient1@example.com,recipient2@example.com",
  "cc": "cc@example.com",
  "bcc": "bcc@example.com",
  "subject": "Your Email Subject",
  "body": "<h1>Hello World!</h1><p>This is a test email.</p>",
  "contentType": "text/html",
  "attachments": [
    {
      "filename": "document.pdf",
      "content": "base64-encoded-content",
      "contentType": "application/pdf",
      "disposition": "attachment"
    }
  ],
  "replyTo": "noreply@example.com",
  "priority": "normal",
  "customerReference": "CUSTOM_REF_123",
  "callbackUrl": "https://your-domain.com/email-callback"
}
```

### Email Management

#### Get Email History
```http
GET /bulk-email/history?page=1&limit=10&status=sent
```

#### Get Email by ID
```http
GET /bulk-email/email/{id}
```

#### Get Wallet Balance
```http
GET /bulk-email/balance
```

### Pricing Tiers

#### Get All Tiers
```http
GET /bulk-email/tiers
```

#### Create New Tier
```http
POST /bulk-email/tiers
Content-Type: application/json

{
  "name": "Standard Tier",
  "minEmails": 1,
  "maxEmails": 1000,
  "pricePerEmail": 0.05,
  "provider": "gmail_smtp",
  "isActive": true
}
```

#### Update Tier
```http
POST /bulk-email/tiers/{id}
Content-Type: application/json

{
  "name": "Updated Tier Name",
  "pricePerEmail": 0.04
}
```

#### Deactivate Tier
```http
POST /bulk-email/tiers/{id}/deactivate
```

## Usage Examples

### Basic Email Sending

```typescript
import { BulkEmailService } from './bulk-email/bulk-email.service';

// Inject the service
constructor(private readonly bulkEmailService: BulkEmailService) {}

// Send a simple email
const result = await this.bulkEmailService.sendEmail({
  from: 'noreply@yourcompany.com',
  fromName: 'Your Company',
  to: 'customer@example.com',
  subject: 'Welcome to Our Service!',
  body: '<h1>Welcome!</h1><p>Thank you for joining us.</p>',
  contentType: 'text/html'
});
```

### Email with Attachments

```typescript
const result = await this.bulkEmailService.sendEmail({
  from: 'noreply@yourcompany.com',
  to: 'customer@example.com',
  subject: 'Your Invoice',
  body: '<p>Please find your invoice attached.</p>',
  attachments: [
    {
      filename: 'invoice.pdf',
      content: 'base64-encoded-pdf-content',
      contentType: 'application/pdf',
      disposition: 'attachment'
    }
  ]
});
```

### Using Email Templates

```typescript
import { basicEmailTemplate } from './bulk-email/templates/basic-email.template';
import { marketingEmailTemplate } from './bulk-email/templates/marketing-email.template';

// Basic template
const basicHtml = basicEmailTemplate({
  subject: 'Welcome Email',
  title: 'Welcome to Our Platform!',
  content: '<p>Thank you for signing up...</p>',
  companyName: 'Your Company',
  unsubscribeUrl: 'https://yourdomain.com/unsubscribe'
});

// Marketing template
const marketingHtml = marketingEmailTemplate({
  subject: 'Special Offer!',
  title: '50% Off Everything!',
  subtitle: 'Limited time offer',
  content: '<p>Don\'t miss out on our biggest sale...</p>',
  ctaText: 'Shop Now',
  ctaUrl: 'https://yourdomain.com/sale',
  socialLinks: {
    facebook: 'https://facebook.com/yourcompany',
    twitter: 'https://twitter.com/yourcompany'
  }
});

const result = await this.bulkEmailService.sendEmail({
  from: 'marketing@yourcompany.com',
  to: 'subscribers@example.com',
  subject: 'Special Offer!',
  body: marketingHtml,
  contentType: 'text/html'
});
```

## Professional Email Service Providers

While Gmail SMTP works well for development and small-scale operations, consider these professional alternatives for production:

### 1. **SendGrid** (Recommended)
- **Pros**: High deliverability, detailed analytics, template engine, A/B testing
- **Cons**: Can be expensive for high volume
- **Best for**: Marketing emails, transactional emails
- **Setup**: Use SendGrid's Node.js SDK

### 2. **Amazon SES**
- **Pros**: Very cost-effective, high deliverability, integrates with AWS
- **Cons**: Requires AWS setup, more complex configuration
- **Best for**: High-volume transactional emails
- **Setup**: Use AWS SDK for JavaScript

### 3. **Mailgun**
- **Pros**: Developer-friendly, good deliverability, webhook support
- **Cons**: Limited free tier
- **Best for**: Developer-focused applications
- **Setup**: Use Mailgun's Node.js SDK

### 4. **Postmark**
- **Pros**: Excellent deliverability, great for transactional emails
- **Cons**: More expensive, focused on transactional emails
- **Best for**: Transactional emails, receipts, notifications

## Implementation with Professional Providers

### SendGrid Integration Example

```typescript
// Install: npm install @sendgrid/mail
import * as sendgrid from '@sendgrid/mail';

@Injectable()
export class SendGridEmailService {
  constructor() {
    sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async sendEmail(emailData: SendEmailDto) {
    const msg = {
      to: emailData.to.split(','),
      from: {
        email: emailData.from,
        name: emailData.fromName || 'Your Company'
      },
      subject: emailData.subject,
      html: emailData.body,
      attachments: emailData.attachments?.map(att => ({
        content: att.content,
        filename: att.filename,
        type: att.contentType,
        disposition: att.disposition
      }))
    };

    try {
      const result = await sendgrid.send(msg);
      return { success: true, messageId: result[0].headers['x-message-id'] };
    } catch (error) {
      throw new Error(`SendGrid error: ${error.message}`);
    }
  }
}
```

### Amazon SES Integration Example

```typescript
// Install: npm install aws-sdk
import * as AWS from 'aws-sdk';

@Injectable()
export class SESEmailService {
  private ses: AWS.SES;

  constructor() {
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION
    });
    this.ses = new AWS.SES();
  }

  async sendEmail(emailData: SendEmailDto) {
    const params = {
      Source: emailData.from,
      Destination: {
        ToAddresses: emailData.to.split(','),
        CcAddresses: emailData.cc?.split(',') || [],
        BccAddresses: emailData.bcc?.split(',') || []
      },
      Message: {
        Subject: { Data: emailData.subject },
        Body: {
          Html: { Data: emailData.body }
        }
      }
    };

    try {
      const result = await this.ses.sendEmail(params).promise();
      return { success: true, messageId: result.MessageId };
    } catch (error) {
      throw new Error(`SES error: ${error.message}`);
    }
  }
}
```

## Best Practices

### 1. **Email Deliverability**
- Use a dedicated IP address for high-volume sending
- Implement SPF, DKIM, and DMARC records
- Maintain a clean email list (remove bounces, unsubscribes)
- Use double opt-in for subscriptions

### 2. **Rate Limiting**
- Implement delays between email sends to avoid being flagged as spam
- Use queues for bulk email processing
- Respect provider rate limits

### 3. **Template Management**
- Use responsive email templates
- Test templates across different email clients
- Include unsubscribe links in marketing emails
- Use consistent branding

### 4. **Monitoring & Analytics**
- Track delivery rates, open rates, and click rates
- Monitor bounce rates and spam complaints
- Set up alerts for delivery failures
- Use webhooks for real-time status updates

### 5. **Security**
- Validate email addresses before sending
- Sanitize HTML content to prevent XSS
- Use HTTPS for callback URLs
- Implement rate limiting on API endpoints

## Error Handling

The service includes comprehensive error handling:

- **Validation Errors**: Invalid email addresses, missing required fields
- **SMTP Errors**: Connection failures, authentication errors
- **Rate Limiting**: Too many requests, provider limits
- **Attachment Errors**: Invalid file types, size limits

## Monitoring & Logging

All email operations are logged with:
- Timestamp and operation type
- Success/failure status
- Error messages and stack traces
- Email metadata (recipients, subject, cost)

## Cost Management

The service tracks costs through:
- Tier-based pricing system
- Real-time cost calculation
- Wallet balance tracking
- Transaction history
- Spending analytics

## Webhook Integration

Set up webhooks to receive delivery status updates:

```typescript
// Example webhook handler
@Controller('webhooks')
export class EmailWebhookController {
  @Post('email-status')
  async handleEmailStatus(@Body() payload: any) {
    // Update email status in database
    await this.updateEmailStatus(payload.messageId, payload.status);
  }
}
```

## Testing

### Unit Tests
```bash
npm run test bulk-email
```

### Integration Tests
```bash
npm run test:e2e bulk-email
```

## Deployment Considerations

1. **Environment Variables**: Ensure all SMTP credentials are properly set
2. **Database**: Run migrations before deployment
3. **Rate Limits**: Configure appropriate rate limiting
4. **Monitoring**: Set up email delivery monitoring
5. **Backup**: Regular database backups for email records

## Support

For issues or questions:
1. Check the logs in `logs/combined.log` and `logs/error.log`
2. Verify environment variables are correctly set
3. Test SMTP connection independently
4. Check database connectivity and migrations

## License

This bulk email service is part of your B-Tech backend project and follows the same licensing terms.
