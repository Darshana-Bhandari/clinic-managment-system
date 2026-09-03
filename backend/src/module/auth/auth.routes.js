import express from 'express';
import * as authController from './auth.controller.js';
import { verifyToken } from '../../middleware/authMiddleware.js';
import { uploadAvatar } from '../../config/multer.js';
import { handleMulterError } from '../../middleware/multerMiddleware.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
router.post('/register', authController.register);
router.post('/login', authController.login);

// Email Verification
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);

// Password Reset
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Token Management
router.post('/refresh-token', authController.refreshToken);

// ==================== PROTECTED ROUTES ====================
router.use(verifyToken);

router.post('/logout', authController.logout);
router.get('/profile', authController.getProfile);

// Profile update — supports optional avatar upload
router.put(
  '/profile',
  uploadAvatar,
  handleMulterError,
  authController.updateProfile
);

router.post('/change-password', authController.changePassword);

// Avatar upload (dedicated endpoint)
router.post(
  '/profile/avatar',
  uploadAvatar,
  handleMulterError,
  authController.uploadAvatar
);

export default router;