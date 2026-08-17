import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
  PORT: Number(process.env.PORT || 5000),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'mysql://root:root@localhost:3306/clinic_management',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'dev_access_secret',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  COOKIE_SECURE: process.env.COOKIE_SECURE === 'true',
  COOKIE_SAME_SITE: process.env.COOKIE_SAME_SITE || 'lax',
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || undefined,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  RESET_PASSWORD_URL: process.env.RESET_PASSWORD_URL || 'http://localhost:3000/reset-password',
  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
  EMAIL_PORT: Number(process.env.EMAIL_PORT || 587),
  EMAIL_USER: process.env.EMAIL_USER || 'noreply@example.com',
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || 'changeme',
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@yourapp.com',
  OTP_EXPIRY_MINUTES: Number(process.env.OTP_EXPIRY_MINUTES || 10),
  OTP_LENGTH: Number(process.env.OTP_LENGTH || 6),
  OTP_RATE_LIMIT_WINDOW: Number(process.env.OTP_RATE_LIMIT_WINDOW || 60),
  OTP_RATE_LIMIT_MAX: Number(process.env.OTP_RATE_LIMIT_MAX || 5),
  RESEND_OTP_RATE_LIMIT_WINDOW: Number(process.env.RESEND_OTP_RATE_LIMIT_WINDOW || 60),
  RESEND_OTP_RATE_LIMIT_MAX: Number(process.env.RESEND_OTP_RATE_LIMIT_MAX || 3),
};