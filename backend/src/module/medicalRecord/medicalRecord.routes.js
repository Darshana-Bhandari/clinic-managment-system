import { Router } from 'express';
import * as medicalRecordController from './medicalRecord.controller.js';
import { verifyToken, authorize } from '../../middleware/authMiddleware.js';
import { uploadSingle, uploadFields } from '../../config/multer.js';
import { handleMulterError } from '../../middleware/multerMiddleware.js';

const router = Router();

// All routes require authentication
router.use(verifyToken);

// ==================== MEDICAL RECORDS ====================

// Patient history
router.get(
  '/patient/:patientId/history',
  authorize('ADMIN', 'DOCTOR', 'RECEPTIONIST'),
  medicalRecordController.getPatientMedicalHistory
);

// List / create medical records
router.get(
  '/',
  authorize('ADMIN', 'DOCTOR', 'RECEPTIONIST'),
  medicalRecordController.getAllMedicalRecords
);
router.post(
  '/',
  authorize('ADMIN', 'DOCTOR'),
  medicalRecordController.createMedicalRecord
);

// Get / update / delete single record
router.get(
  '/:id',
  authorize('ADMIN', 'DOCTOR', 'RECEPTIONIST'),
  medicalRecordController.getMedicalRecordById
);
router.put(
  '/:id',
  authorize('ADMIN', 'DOCTOR'),
  medicalRecordController.updateMedicalRecord
);
router.delete(
  '/:id',
  authorize('ADMIN'),
  medicalRecordController.deleteMedicalRecord
);

// ==================== PRESCRIPTIONS ====================

router.post(
  '/prescription',
  authorize('ADMIN', 'DOCTOR'),
  medicalRecordController.createPrescription
);

router.get(
  '/prescription/:id',
  authorize('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT'),
  medicalRecordController.getPrescriptionById
);
router.put(
  '/prescription/:id',
  authorize('ADMIN', 'DOCTOR'),
  medicalRecordController.updatePrescription
);
router.delete(
  '/prescription/:id',
  authorize('ADMIN', 'DOCTOR'),
  medicalRecordController.deletePrescription
);

// ==================== REPORTS (with file upload) ====================

// Create report — supports a single report file (PDF/image)
router.post(
  '/report',
  authorize('ADMIN', 'DOCTOR'),
  uploadSingle,
  handleMulterError,
  medicalRecordController.createReport
);

router.get(
  '/report/:id',
  authorize('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT'),
  medicalRecordController.getReportById
);

// Update report — also allows replacing the report file
router.put(
  '/report/:id',
  authorize('ADMIN', 'DOCTOR'),
  uploadSingle,
  handleMulterError,
  medicalRecordController.updateReport
);

router.delete(
  '/report/:id',
  authorize('ADMIN', 'DOCTOR'),
  medicalRecordController.deleteReport
);

export default router;