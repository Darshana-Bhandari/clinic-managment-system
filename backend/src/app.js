import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import router from './routes/index.js';
import { ENV } from './config/env.js';
import {
  globalApiLimiter,
} from './middleware/rateLimiter.js';
import sanitize from './middleware/sanitize.js';
import helmetConfig, { extraSecurityHeaders, noCacheMiddleware } from './middleware/securityHeaders.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.set('trust proxy', ENV.NODE_ENV === 'production' ? 1 : 0);

// ============================================================
// SECURITY MIDDLEWARE STACK
// ============================================================

// 1. Helmet CSP / HSTS / frameguard / etc.
app.use(helmetConfig);
app.use(extraSecurityHeaders);

// 2. CORS — strict origin list + credentials
const allowedOrigins = [
  ENV.FRONTEND_URL,
  'http://localhost:5173',    // localhost:5155
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (ENV.NODE_ENV === 'development') return callback(null, true);
      callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    exposedHeaders: ['Content-Length', 'Content-Disposition', 'X-Total-Count'],
    maxAge: 86400,
    optionsSuccessStatus: 204,
  })
);

// 3. Global API rate limiting
app.use('/api', globalApiLimiter);

// 4. Request size limits & parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

if (ENV.NODE_ENV !== 'production') {
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
}

// 5. XSS + SQL injection sanitization on body/params/query
app.use(sanitize);

// 6. Disable route/method fingerprinting
app.disable('x-powered-by');
app.set('etag', 'strong');

// 7. Prevent browser caching of authenticated pages
app.use((req, res, next) => {
  const authHeader = req.headers.authorization || req.cookies?.accessToken;
  if (authHeader || req.path.startsWith('/api/auth')) {
    return noCacheMiddleware(req, res, next);
  }
  next();
});

// ============================================================
// ROUTES
// ============================================================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Clinic Management System API is running.',
    health: '/api/health',
  });
});

app.use('/api', router);

// ============================================================
// 404
// ============================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  const isProd = ENV.NODE_ENV === 'production';

  if (err && err.code === 'ECONNREFUSED' || err?.message?.includes('PrismaClient')) {
    console.error('[DB ERROR]:', err.message);
    return res.status(503).json({
      success: false,
      message: 'Database service is unavailable. Please try again later.',
      code: 'DB_UNAVAILABLE',
    });
  }

  if (err?.name === 'PrismaClientKnownRequestError') {
    console.error('[Prisma Error]:', err.code, err.message);
    switch (err.code) {
      case 'P2002':
        return res.status(409).json({
          success: false,
          message: 'A record with that value already exists.',
          code: 'DUPLICATE_RECORD',
          target: err.meta?.target,
        });
      case 'P2025':
        return res.status(404).json({
          success: false,
          message: 'Requested record not found.',
          code: 'RECORD_NOT_FOUND',
        });
      case 'P2003':
        return res.status(409).json({
          success: false,
          message: 'Related record not found (foreign key violation).',
          code: 'FK_VIOLATION',
        });
      default:
        return res.status(500).json({
          success: false,
          message: isProd ? 'Database error' : err.message,
          code: 'DB_ERROR',
        });
    }
  }

  if (err?.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors: err.issues?.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      })) || [],
    });
  }

  if (err?.name === 'TokenExpiredError' || err?.code === 'ACCESS_TOKEN_EXPIRED') {
    return res.status(401).json({
      success: false,
      message: 'Access token expired. Please log in again.',
      code: 'TOKEN_EXPIRED',
    });
  }

  if (err?.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token. Please log in again.',
      code: 'INVALID_TOKEN',
    });
  }

  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'File too large. Maximum 10MB allowed.',
      code: 'FILE_TOO_LARGE',
    });
  }
  if (err?.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: `Unexpected file field: "${err.field}"`,
      code: 'UNEXPECTED_FILE',
    });
  }

  if (err?.message?.startsWith('CORS blocked')) {
    return res.status(403).json({
      success: false,
      message: 'Request blocked by CORS policy.',
      code: 'CORS_BLOCKED',
    });
  }

  if (err?.type === 'entity.too.large' || err?.status === 413) {
    return res.status(413).json({
      success: false,
      message: 'Request body too large.',
      code: 'PAYLOAD_TOO_LARGE',
    });
  }

  if (err?.status === 429 || err?.message?.includes('Too many')) {
    return res.status(429).json({
      success: false,
      message: err.message || 'Too many requests. Please try again later.',
      code: 'RATE_LIMITED',
    });
  }

  if (err?.status === 400 || (err.code && String(err.code).startsWith('400'))) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Bad request.',
      code: err.code || 'BAD_REQUEST',
    });
  }

  console.error('[Unhandled Error]:', err);

  return res.status(err.status || 500).json({
    success: false,
    message: isProd ? 'Something went wrong on the server.' : err.message,
    code: err.code || 'SERVER_ERROR',
    stack: isProd ? undefined : err.stack,
  });
});

export default app;