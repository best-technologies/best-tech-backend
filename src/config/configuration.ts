export default () => ({
  port: process.env.PORT || 3000,
  database: {
    url: process.env.DATABASE_URL,
  },
  bulksms: {
    token: process.env.BULKSMSTOKEN,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRATION,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION,
  },
});