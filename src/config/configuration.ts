export default () => ({
  port: process.env.PORT || 3000,
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRATION,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION,
  },
  email: {
    providers: (process.env.EMAIL_PROVIDER || 'gmail')
      .split(',')
      .map((provider) => provider.trim().toLowerCase())
      .filter(Boolean),
    gmail: {
      host: process.env.GOOGLE_SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.GOOGLE_SMTP_PORT || '587', 10),
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASSWORD,
    },
    resend: {
      apiKey: process.env.RESEND_API_KEY,
      fromEmail: process.env.RESEND_FROM_EMAIL,
    },
  },
  storage: {
    provider: (process.env.STORAGE_PROVIDER || 'cloudinary').toLowerCase(),
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'af-south-1',
      bucket: process.env.AWS_S3_BUCKET,
      autoCreateBucket: process.env.AWS_S3_AUTO_CREATE_BUCKET === 'true',
    },
  },
});
