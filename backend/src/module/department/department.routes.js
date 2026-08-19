import express from 'express';

import * as departmentController from './department.controller.js';

import { validate } from '../../middleware/validateMiddleware.js';

import {
  createDepartmentSchema,
  updateDepartmentSchema,
} from './departme.schema.js';

import {
  verifyToken,
  authorize,
} from '../../middleware/authMiddleware.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

// Get all departments
router.get('/', departmentController.getAllDepartments);

// Get department by ID
router.get('/:id', departmentController.getDepartmentById);

// Get doctors for a department
router.get('/:id/doctors', departmentController.getDepartmentDoctors);

// ==================== AUTHENTICATED ROUTES ====================

router.use(verifyToken);

// ==================== ADMIN ONLY ROUTES ====================

router.use(authorize('ADMIN'));

// Create department
router.post(
  '/',
  validate(createDepartmentSchema),
  departmentController.createDepartment
);

// Update department
router.put(
  '/:id',
  validate(updateDepartmentSchema),
  departmentController.updateDepartment
);

// Delete department
router.delete(
  '/:id',
  departmentController.deleteDepartment
);

// Add doctor to department
router.post(
  '/:id/doctors',
  departmentController.addDoctorToDepartment
);

// Remove doctor from department
router.delete(
  '/:id/doctors/:doctorId',
  departmentController.removeDoctorFromDepartment
);

export default router;