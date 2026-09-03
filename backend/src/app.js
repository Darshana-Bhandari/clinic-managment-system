import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
// import cors from 'cors';
import rateLimit from 'express-rate-limit';
import router from './routes/index.js';
import { ENV } from './config/env.js';

const app = express();

// ==================== SECURITY ====================
app.use(helmet());

// // CORS
// app.use(
//   cors({
//     origin: ENV.FRONTEND_URL || 'http://localhost:5173',
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//   })
// );

// RATE LIMITING 
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// BODY PARSERS
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ROUTES 
app.use('/api', router);

// 404 HANDLER 
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error('Global error:', err);

  // Multer errors not caught at route level
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, message: 'File too large. Maximum 10MB allowed.' });
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ success: false, message: `Unexpected file field: "${err.field}"` });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: ENV.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

export default app;