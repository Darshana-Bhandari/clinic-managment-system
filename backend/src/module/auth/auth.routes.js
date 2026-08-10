import express from 'express';
import * as authController from './auth.controller.js';
import { verifyToken } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Public Routes
router.post('/register', ...authController.register);
router.post('/login', ...authController.login);

// Email Verification
router.post('/verify-email', ...authController.verifyEmail);
router.post('/resend-verification', ...authController.resendVerification);

// Password Reset
router.post('/forgot-password', ...authController.forgotPassword);
router.post('/reset-password', ...authController.resetPassword);

// Token Management
router.post('/refresh-token', authController.refreshToken);

// Protected Routes
router.use(verifyToken);
router.post('/logout', authController.logout);
router.get('/profile', authController.getProfile);
router.put('/profile', ...authController.updateProfile);
router.post('/change-password', ...authController.changePassword);

export default router;