# Bulk Email Service Setup Guide

## Quick Start

### 1. Install Dependencies
The bulk email service uses `nodemailer` which is already installed in your project.

### 2. Environment Variables
Add these to your `.env` file:

```env
# Gmail SMTP Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
GOOGLE_SMTP_HOST=smtp.gmail.com
GOOGLE_SMTP_PORT=587
```

### 3. Database Migration
Run the following commands to set up the database:

```bash
# Generate Prisma client
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name add-bulk-email-models

# Optional: View your data in Prisma Studio
npx prisma studio
```

### 4. Test the Service
Start your application and test the endpoints:

```bash
npm run start:dev
```

## API Testing

### Test Email Sending
```bash
curl -X POST http://localhost:3000/bulk-email/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "from": "your-email@gmail.com",
    "fromName": "Test Company",
    "to": "recipient@example.com",
    "subject": "Test Email",
    "body": "<h1>Hello World!</h1><p>This is a test email from your bulk email service.</p>",
    "contentType": "text/html"
  }'
```

### Test Wallet Balance
```bash
curl -X GET http://localhost:3000/bulk-email/balance
```

### Test Email History
```bash
curl -X GET http://localhost:3000/bulk-email/history
```

## Gmail Setup

### 1. Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification

### 2. Generate App Password
1. In Google Account settings, go to Security
2. Under "2-Step Verification", click "App passwords"
3. Select "Mail" as the app
4. Generate the password
5. Use this password in your `EMAIL_PASSWORD` environment variable

### 3. Test SMTP Connection
You can test your SMTP connection using this simple script:

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log('SMTP Error:', error);
  } else {
    console.log('SMTP Server is ready to take our messages');
  }
});
```

## Production Considerations

### 1. Professional Email Providers
For production use, consider these alternatives to Gmail SMTP:

- **SendGrid**: Best for marketing emails
- **Amazon SES**: Most cost-effective for high volume
- **Mailgun**: Developer-friendly
- **Postmark**: Best for transactional emails

### 2. Rate Limiting
Gmail has strict rate limits:
- 500 emails per day (free account)
- 2000 emails per day (paid account)
- 100 recipients per email

### 3. Deliverability
- Use a dedicated domain for sending
- Set up SPF, DKIM, and DMARC records
- Monitor bounce rates and spam complaints

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Check if 2FA is enabled
   - Verify app password is correct
   - Ensure EMAIL_USER and EMAIL_PASSWORD are set

2. **Connection Timeout**
   - Check firewall settings
   - Verify GOOGLE_SMTP_HOST and GOOGLE_SMTP_PORT
   - Try different port (465 for SSL, 587 for TLS)

3. **Rate Limit Exceeded**
   - Reduce email frequency
   - Use professional email service
   - Implement queuing system

4. **Database Errors**
   - Run `npx prisma migrate dev`
   - Check database connection
   - Verify Prisma schema

### Debug Mode
Enable debug logging by setting:
```env
LOG_LEVEL=debug
```

## Next Steps

1. **Set up email templates** for your common email types
2. **Configure webhooks** for delivery status updates
3. **Implement queuing** for bulk email processing
4. **Set up monitoring** and alerting
5. **Create email campaigns** using the marketing templates

## Support

If you encounter any issues:
1. Check the application logs
2. Verify all environment variables
3. Test SMTP connection independently
4. Review the comprehensive documentation in `BULK_EMAIL_README.md`
