import express from 'express';

import * as doctorController from './doctor.controller.js';

import {
  createDoctorSchema,
  updateDoctorSchema,
  doctorIdSchema,
  rateDoctorSchema,
  validate,
} from './docter.schema.js';

import { verifyToken, authorize } from '../../middleware/authMiddleware.js';

import { ROLES } from '../../constans/roles.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

router.get('/public', doctorController.getAllDoctors);

router.get('/public/:id', doctorController.getDoctorById);

// ==================== AUTHENTICATED ROUTES ====================

router.use(verifyToken);

// Create doctor - Admin only
router.post(
  '/',
  authorize(ROLES.ADMIN),
  validate(createDoctorSchema),
  doctorController.createDoctor
);

// Get all doctors - Admin, Patient, Receptionist
router.get(
  '/',
  authorize(ROLES.ADMIN, ROLES.PATIENT, ROLES.RECEPTIONIST),
  doctorController.getAllDoctors
);

// Get current user's doctor profile
router.get(
  '/me',
  doctorController.getDoctorByUserId
);

// Get doctor by ID
router.get(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.PATIENT, ROLES.RECEPTIONIST),
  doctorController.getDoctorById
);

// Update doctor - Admin only
router.put(
  '/:id',
  authorize(ROLES.ADMIN),
  validate(updateDoctorSchema),
  doctorController.updateDoctor
);

// Delete doctor - Admin only
router.delete(
  '/:id',
  authorize(ROLES.ADMIN),
  doctorController.deleteDoctor
);

// Rate doctor - Patient only
router.post(
  '/:id/rate',
  authorize(ROLES.PATIENT),
  validate(rateDoctorSchema),
  doctorController.rateDoctor
);

// Get doctor statistics
router.get(
  '/:id/statistics',
  authorize(ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST),
  doctorController.getDoctorStatistics
);

// Get doctor availability
router.get(
  '/:id/availability',
  authorize(ROLES.ADMIN, ROLES.PATIENT, ROLES.RECEPTIONIST),
  doctorController.getDoctorAvailability
);

export default router;