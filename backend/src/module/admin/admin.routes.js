import express from 'express';
import { ROLES } from '../../constans/roles.js';
import { verifyToken, authorize } from '../../middleware/authMiddleware.js';
import { validate } from '../../middleware/validateMiddleware.js';
import * as adminController from './admin.controller.js';
import {
  updateUserSchema,
  updateUserRoleSchema,
  listUsersQuerySchema,
} from './admin.schema.js';

const router = express.Router();

// All admin routes require authentication + ADMIN role
router.use(verifyToken);
router.use(authorize(ROLES.ADMIN));

// Query parameter validation helper
const validateQuery = (schema) => (req, res, next) => {
  try {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      const formatted = parsed.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return res.status(422).json({
        success: false,
        message: 'Invalid query parameters',
        errors: formatted,
      });
    }
    req.query = parsed.data;
    next();
  } catch (err) {
    next(err);
  }
};

// ==================== USER MANAGEMENT ====================

// List all users with pagination + filters
router.get(
  '/users',
  validateQuery(listUsersQuerySchema),
  adminController.listUsers
);

// Get single user
router.get('/users/:id', adminController.getUserById);

// Update user profile
router.put(
  '/users/:id',
  validate(updateUserSchema),
  adminController.updateUser
);

// Update user role
router.put(
  '/users/:id/role',
  validate(updateUserRoleSchema),
  adminController.updateUserRole
);

// Toggle active status
router.patch('/users/:id/status', adminController.toggleUserStatus);

// Delete user
router.delete('/users/:id', adminController.deleteUser);

// ==================== AUDIT LOGS ====================

// Get audit logs with pagination + filters
router.get('/audit-logs', adminController.getAuditLogs);

export default router;