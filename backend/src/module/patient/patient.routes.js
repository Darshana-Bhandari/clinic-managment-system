import express from 'express';
import * as patientController from './patientController.js';
import { authorize, verifyToken } from '../../middleware/authMiddleware.js';
import { validate } from '../../middleware/validateMiddleware.js';
import { createPatientSchema, updatePatientSchema } from './patient.schema.js';
import { ROLES } from '../../constans/roles.js';
import { uploadMultiple } from '../../config/multer.js';
import { handleMulterError } from '../../middleware/multerMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// ==================== PATIENT ROUTES ====================

// Create patient profile (with optional document uploads)
router.post(
  '/',
  authorize(ROLES.PATIENT, ROLES.RECEPTIONIST, ROLES.ADMIN),
  uploadMultiple,
  handleMulterError,
  validate(createPatientSchema),
  patientController.createPatient
);

// Get all patients (admin/doctor/receptionist)
router.get(
  '/',
  authorize(ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST),
  patientController.getAllPatients
);

// Get current user's own patient profile
router.get('/me', patientController.getPatientByUserId);

// Get patient by ID
router.get(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST),
  patientController.getPatientById
);

// Update patient (with optional new document uploads + removal)
router.put(
  '/:id',
  authorize(ROLES.PATIENT, ROLES.RECEPTIONIST, ROLES.ADMIN),
  uploadMultiple,
  handleMulterError,
  validate(updatePatientSchema),
  patientController.updatePatient
);

// Delete patient (admin only)
router.delete('/:id', authorize(ROLES.ADMIN), patientController.deletePatient);

// Get patient appointment statistics
router.get(
  '/:id/statistics',
  authorize(ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST),
  patientController.getPatientStatistics
);

export default router;