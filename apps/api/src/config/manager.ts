export const config = {
  databaseUrl: process.env.DATABASE_URL,
  secretKey: {
    accessToken: process.env.ACCESS_TOKEN_SECRET_KEY,
    refreshToken: process.env.REFRESH_TOKEN_SECRET_KEY,
  },
  expiresIn: {
    accessToken: process.env.ACCESS_TOKEN_EXPIRES_IN,
    refreshToken: process.env.REFRESH_TOKEN_EXPIRES_IN,
  },
};
