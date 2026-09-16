import express from 'express';
import { ROLES } from '../../constans/roles.js';
import { verifyToken, authorize } from '../../middleware/authMiddleware.js';
import { validate } from '../../middleware/validateMiddleware.js';
import * as staffController from './staff.controller.js';
import {
  createStaffSchema,
  updateStaffSchema,
  queryStaffSchema,
} from './staff.schema.js';

const router = express.Router();

// All staff routes require authentication + ADMIN role
router.use(verifyToken);
router.use(authorize(ROLES.ADMIN));

// Query params validation for GET /
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

// ==================== STAFF MANAGEMENT (ADMIN ONLY) ====================

// Create a staff account (DOCTOR / RECEPTIONIST)
router.post(
  '/',
  validate(createStaffSchema),
  staffController.createStaff
);

// List all staff with pagination + filters
router.get(
  '/',
  validateQuery(queryStaffSchema),
  staffController.listStaff
);

// Get single staff by id
router.get('/:id', staffController.getStaffById);

// Update staff profile
router.put(
  '/:id',
  validate(updateStaffSchema),
  staffController.updateStaff
);

// Toggle active status
router.patch('/:id/status', staffController.toggleStaffStatus);

// Delete staff
router.delete('/:id', staffController.deleteStaff);

export default router;