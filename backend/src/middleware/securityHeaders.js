import helmet from 'helmet';
import { ENV } from '../config/env.js';

const FRONTEND_ORIGINS = [ENV.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000'].filter(Boolean);

export const helmetConfig = helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://cdn.jsdelivr.net',
        'https://unpkg.com',
        ...(ENV.NODE_ENV === 'development' ? ["'unsafe-eval'"] : []),
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://cdn.jsdelivr.net',
        'https://fonts.googleapis.com',
        'https://unpkg.com',
      ],
      imgSrc: [
        "'self'",
        'data:',
        'blob:',
        'https:',
      ],
      fontSrc: [
        "'self'",
        'https://fonts.gstatic.com',
        'data:',
      ],
      connectSrc: [
        "'self'",
        ...FRONTEND_ORIGINS,
        'wss:',
        'ws:',
        'https://khalti.com',
        'https://dev.khalti.com',
      ],
      frameAncestors: ["'none'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: ENV.NODE_ENV === 'production' ? [] : null,
    },
  },
  hsts: ENV.NODE_ENV === 'production'
    ? { maxAge: 31536000, includeSubDomains: true, preload: true }
    : false,
  frameguard: { action: 'deny' },
  xssFilter: true,
  noSniff: true,
  ieNoOpen: true,
  hidePoweredBy: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  permittedCrossDomainPolicies: { policy: 'none' },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'same-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin' },
});

export const noCacheMiddleware = (_req, res, next) => {
  res.setHeader('Surrogate-Control', 'no-store');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
};

export const extraSecurityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
};

export default helmetConfig;