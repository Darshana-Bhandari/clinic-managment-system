import express from 'express';
import * as doctorController from './doctor.controller.js';
import {
  createDoctorSchema,
  updateDoctorSchema,
  doctorIdSchema,
  rateDoctorSchema,
} from './doctor.schema.js';
import { verifyToken, authorize } from '../../middleware/authMiddleware.js';
import { validate } from '../../middleware/validateMiddleware.js';
import { ROLES } from '../../constans/roles.js';
import { uploadFields } from '../../config/multer.js';
import { handleMulterError } from '../../middleware/multerMiddleware.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
router.get('/public', doctorController.getAllDoctors);
router.get('/public/:id', doctorController.getDoctorById);

// ==================== PROTECTED ROUTES ====================
router.use(verifyToken);

// Create doctor — supports profilePicture + certificates upload
router.post(
  '/',
  authorize(ROLES.ADMIN),
  uploadFields,
  handleMulterError,
  validate(createDoctorSchema),
  doctorController.createDoctor
);

// Get all doctors
router.get(
  '/',
  authorize(ROLES.ADMIN, ROLES.PATIENT, ROLES.RECEPTIONIST),
  doctorController.getAllDoctors
);

// Get current user's doctor profile
router.get('/me', doctorController.getDoctorByUserId);

// Get doctor by ID
router.get(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.PATIENT, ROLES.RECEPTIONIST),
  doctorController.getDoctorById
);

// Update doctor — supports new certificates upload and removals
router.put(
  '/:id',
  authorize(ROLES.ADMIN),
  uploadFields,
  handleMulterError,
  validate(updateDoctorSchema),
  doctorController.updateDoctor
);

// Delete doctor
router.delete('/:id', authorize(ROLES.ADMIN), doctorController.deleteDoctor);

// Rate doctor (Patient only)
router.post('/:id/rate', authorize(ROLES.PATIENT), validate(rateDoctorSchema), doctorController.rateDoctor);

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