import { Router } from 'express';
import * as medicalRecordController from './medicalRecord.controller.js';
import { verifyToken, authorize } from '../../middleware/authMiddleware.js';

const router = Router();

// Protect all routes
router.use(verifyToken);

// ==================== MEDICAL RECORDS ====================

// Get patient history
router.get(
  '/patient/:patientId/history',
  authorize('ADMIN', 'DOCTOR', 'RECEPTIONIST'),
  medicalRecordController.getPatientMedicalHistory
);

// Base medical record routes
router
  .route('/')
  .get(
    authorize('ADMIN', 'DOCTOR', 'RECEPTIONIST'),
    medicalRecordController.getAllMedicalRecords
  )
  .post(
    authorize('ADMIN', 'DOCTOR'),
    medicalRecordController.createMedicalRecord
  );

router
  .route('/:id')
  .get(
    authorize('ADMIN', 'DOCTOR', 'RECEPTIONIST'),
    medicalRecordController.getMedicalRecordById
  )
  .put(
    authorize('ADMIN', 'DOCTOR'),
    medicalRecordController.updateMedicalRecord
  )
  .delete(
    authorize('ADMIN'),
    medicalRecordController.deleteMedicalRecord
  );

// ==================== PRESCRIPTIONS ====================

router
  .route('/prescription')
  .post(
    authorize('ADMIN', 'DOCTOR'),
    medicalRecordController.createPrescription
  );

router
  .route('/prescription/:id')
  .get(
    authorize('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT'),
    medicalRecordController.getPrescriptionById
  )
  .put(
    authorize('ADMIN', 'DOCTOR'),
    medicalRecordController.updatePrescription
  )
  .delete(
    authorize('ADMIN', 'DOCTOR'),
    medicalRecordController.deletePrescription
  );

// ==================== REPORTS ====================

router
  .route('/report')
  .post(
    authorize('ADMIN', 'DOCTOR'),
    medicalRecordController.createReport
  );

router
  .route('/report/:id')
  .get(
    authorize('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT'),
    medicalRecordController.getReportById
  )
  .put(
    authorize('ADMIN', 'DOCTOR'),
    medicalRecordController.updateReport
  )
  .delete(
    authorize('ADMIN', 'DOCTOR'),
    medicalRecordController.deleteReport
  );

export default router;