import express from 'express';
import * as authController from './auth.controller.js';
import { verifyToken, isAdmin } from '../../middleware/authMiddleware.js';
import{forgotPassword} from './auth.controller.js'
const router = express.Router();

// All admin routes require authentication and admin role
router.use(verifyToken);
router.use(isAdmin);

// ==================== USER MANAGEMENT ====================

// Get all users with pagination, filter, and search
router.get('/users', authController.getAllUsers);

// Get user by ID
router.get('/users/:id', authController.getUserById);
//forgot password
router.post('/users/:id/forgot-password', authController.forgotPassword);

// Update user role
router.put('/users/:id/role', authController.updateUserRole);

// Toggle user status (activate/deactivate)
router.patch('/users/:id/status', authController.toggleUserStatus);

// Delete user
router.delete('/users/:id', authController.deleteUser);

// ==================== AUDIT LOGS ====================

// Get audit logs with pagination and user filter
router.get('/audit-logs', authController.getAuditLogs);

export default router;