import express from 'express';
import * as dashboardController from './dashboard.controller.js';
import { verifyToken, authorize } from '../../middleware/authMiddleware.js';

const router = express.Router();

// All dashboard routes require authentication
router.use(verifyToken);

// ==================== DASHBOARD ROUTES ====================

// Full statistics summary (Admin only)
router.get(
  '/statistics',
  authorize('ADMIN'),
  dashboardController.getDashboardStats
);

// Daily summary report (Admin + Receptionist)
router.get(
  '/daily-summary',
  authorize('ADMIN', 'RECEPTIONIST'),
  dashboardController.getDailySummary
);

// Revenue report (Admin only)
router.get(
  '/revenue',
  authorize('ADMIN'),
  dashboardController.getRevenueReport
);

// Doctor-wise load (Admin + Receptionist)
router.get(
  '/doctor-load',
  authorize('ADMIN', 'RECEPTIONIST'),
  dashboardController.getDoctorLoad
);

export default router;