import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import router from './routes/index.js';
import { ENV } from './config/env.js';

const app = express();

console.log('🔥 Clinic Management app.js loaded');

// ==================== SECURITY ====================

app.use(helmet());

// ==================== RATE LIMITING ====================

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
    },
});

app.use('/api', limiter);

// ==================== BODY PARSERS ====================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({
    extended: true,
    limit: '10mb',
}));

app.use(cookieParser());

// ==================== HEALTH CHECK ====================

app.get('/', (req, res) => {
    console.log('🔥 ROOT ROUTE HIT');

    res.status(200).json({
        success: true,
        message: 'Clinic Management API is running',
        version: '1.0.0',
    });
});

// ==================== API ROUTES ====================

app.use('/api', router);

// ==================== 404 HANDLER ====================

app.use((req, res) => {
    console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);

    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl,
        method: req.method,
    });
});

// ==================== GLOBAL ERROR HANDLER ====================

app.use((err, req, res, next) => {
    console.error('🔥 Global error:', err);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        error: ENV.NODE_ENV === 'development'
            ? err.stack
            : undefined,
    });
});

export default app;