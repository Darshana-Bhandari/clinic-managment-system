import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { ENV } from '../config/env.js';

const createLimiter = (options = {}) =>
  rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      const forwarded = req.headers['x-forwarded-for'];
      const clientIp = forwarded
        ? String(forwarded).split(',')[0].trim()
        : req.ip || req.socket?.remoteAddress || 'unknown';
      return ipKeyGenerator(clientIp);
    },
    handler: (_req, res) => {
      res.status(429).json({
        success: false,
        message: 'Too many requests. Please slow down and try again later.',
        code: 'TOO_MANY_REQUESTS',
        retryAfter: options.windowMs ? Math.ceil(options.windowMs / 1000) : 60,
      });
    },
    ...options,
  });

export const globalApiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: ENV.NODE_ENV === 'production' ? 200 : 500,
  message: 'Too many API requests from this IP, please try again later.',
});

export const strictAuthLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: false,
  message: 'Too many authentication attempts. Please try again after 15 minutes.',
});

export const passwordResetLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many password reset requests. Please try again in an hour.',
});

export const paymentInitiateLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: 'Too many payment initiation requests. Please try again later.',
});

export const paymentVerifyLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: 50,
  message: 'Too many payment verification requests.',
});

export const webhookLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: 200,
  message: 'Too many webhook calls.',
});

export const fileUploadLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: 'Too many file uploads. Please try again later.',
});

export const appointmentBookingLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: 'Too many booking requests. Please try again later.',
});

export default {
  globalApiLimiter,
  strictAuthLimiter,
  passwordResetLimiter,
  paymentInitiateLimiter,
  paymentVerifyLimiter,
  webhookLimiter,
  fileUploadLimiter,
  appointmentBookingLimiter,
};