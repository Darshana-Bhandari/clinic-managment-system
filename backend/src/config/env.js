import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  // Server
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL,
  
  // JWT
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  // Cookie
  COOKIE_SECURE: process.env.COOKIE_SECURE === 'true',
  COOKIE_SAME_SITE: process.env.COOKIE_SAME_SITE || 'lax',
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || undefined,
  
  // Client
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  RESET_PASSWORD_URL: process.env.RESET_PASSWORD_URL || 'http://localhost:3000/reset-password',
  
  // Email
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT) || 587,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@yourapp.com',
  
  // OTP
  OTP_EXPIRY_MINUTES: parseInt(process.env.OTP_EXPIRY_MINUTES) || 10,
  OTP_LENGTH: parseInt(process.env.OTP_LENGTH) || 6,


  //
  OTP_RATE_LIMIT_WINDOW=parseInt(process.env.OTP_RATE_LIMIT_WINDOW),
OTP_RATE_LIMIT_MAX=parseInt(process.env.OTP_RATE_LIMIT_MAX),
RESEND_OTP_RATE_LIMIT_WINDOW=parseInt(process.env.RESEND_OTP_RATE_LIMIT_WINDOW),
RESEND_OTP_RATE_LIMIT_MAX=parseInt(process.env.RESEND_OTP_RATE_LIMIT_MAX)
};