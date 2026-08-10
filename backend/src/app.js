import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import router from './routes/index.js';
import config from './config/env.js';

const app = express();

// Security
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);



// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ==================== ROUTES ====================

// Authentication Routes
app.use('/api',router);

// // Admin Routes
// app.use('/api/admin', adminRoutes);



// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: config.NODE_ENV === 'development' ? err.message : undefined,
    });
});

export default app;