import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  // Server
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",

  // Database
  DATABASE_URL: process.env.DATABASE_URL,

  // JWT
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",

  // Cookie
  COOKIE_SECURE: process.env.COOKIE_SECURE === "true",
  COOKIE_SAME_SITE: process.env.COOKIE_SAME_SITE || "lax",
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || undefined,

  // // Client
  // CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  RESET_PASSWORD_URL:
    process.env.RESET_PASSWORD_URL ||
    "http://localhost:3000/reset-password",

  // Email
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT) || 587,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  EMAIL_FROM: process.env.EMAIL_FROM || "noreply@yourapp.com",

  // OTP
  OTP_EXPIRY_MINUTES:
    parseInt(process.env.OTP_EXPIRY_MINUTES) || 10,

  OTP_LENGTH:
    parseInt(process.env.OTP_LENGTH) || 6,

  // OTP Rate Limit
  OTP_RATE_LIMIT_WINDOW:
    parseInt(process.env.OTP_RATE_LIMIT_WINDOW) || 900000,

  OTP_RATE_LIMIT_MAX:
    parseInt(process.env.OTP_RATE_LIMIT_MAX) || 5,

  RESEND_OTP_RATE_LIMIT_WINDOW:
    parseInt(process.env.RESEND_OTP_RATE_LIMIT_WINDOW) || 900000,

  RESEND_OTP_RATE_LIMIT_MAX:
    parseInt(process.env.RESEND_OTP_RATE_LIMIT_MAX) || 3,
  Cloud_Name: process.env.Cloud_Name,
  Cloud_API_SECRET: process.env.Cloud_API_SECRET,
  Cloud_API_KEY: process.env.Cloud_API_KEY,

  // Khalti Payment
  KHALTI_SECRET_KEY: process.env.KHALTI_SECRET_KEY,
  KHALTI_RETURN_URL: process.env.KHALTI_RETURN_URL,
  KHALTI_WEBSITE_URL: process.env.KHALTI_WEBSITE_URL,
 
  KHALTI_ENVIRONMENT: process.env.KHALTI_ENVIRONMENT || process.env.KHALTI_ENV || (process.env.NODE_ENV === 'production' ? 'production' : 'test'),
  KHALTI_REQUEST_TIMEOUT: parseInt(process.env.KHALTI_REQUEST_TIMEOUT) || 15000,
  KHALTI_MAX_RETRIES: parseInt(process.env.KHALTI_MAX_RETRIES) || 3,
  KHALTI_RETRY_DELAY_MS: parseInt(process.env.KHALTI_RETRY_DELAY_MS) || 1000,

  // Socket.IO
  SOCKET_CORS_ORIGIN: process.env.SOCKET_CORS_ORIGIN,
  SOCKET_HEARTBEAT_INTERVAL: parseInt(process.env.SOCKET_HEARTBEAT_INTERVAL) || 25000,
  SOCKET_HEARTBEAT_TIMEOUT: parseInt(process.env.SOCKET_HEARTBEAT_TIMEOUT) || 20000,
  SOCKET_MAX_CONNECTIONS_PER_USER: parseInt(process.env.SOCKET_MAX_CONNECTIONS_PER_USER) || 5,

};