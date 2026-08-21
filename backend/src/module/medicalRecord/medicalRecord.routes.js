import { Router } from 'express';
import * as medicalRecordController from './medicalRecord.controller.js';
import { protect, restrictTo } from '../../middleware/authMiddleware.js';

const router = Router();

// Protect all routes
router.use(protect);

// ==================== MEDICAL RECORDS ====================
// Get patient history
router.get('/patient/:patientId/history', restrictTo('ADMIN', 'DOCTOR', 'RECEPTIONIST'), medicalRecordController.getPatientMedicalHistory);

// Base medical record routes
router.route('/')
  .get(restrictTo('ADMIN', 'DOCTOR', 'RECEPTIONIST'), medicalRecordController.getAllMedicalRecords)
  .post(restrictTo('ADMIN', 'DOCTOR'), medicalRecordController.createMedicalRecord);

router.route('/:id')
  .get(restrictTo('ADMIN', 'DOCTOR', 'RECEPTIONIST'), medicalRecordController.getMedicalRecordById)
  .put(restrictTo('ADMIN', 'DOCTOR'), medicalRecordController.updateMedicalRecord)
  .delete(restrictTo('ADMIN'), medicalRecordController.deleteMedicalRecord);

// ==================== PRESCRIPTIONS ====================
router.route('/prescription')
  .post(restrictTo('ADMIN', 'DOCTOR'), medicalRecordController.createPrescription);

router.route('/prescription/:id')
  .get(restrictTo('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT'), medicalRecordController.getPrescriptionById)
  .put(restrictTo('ADMIN', 'DOCTOR'), medicalRecordController.updatePrescription)
  .delete(restrictTo('ADMIN', 'DOCTOR'), medicalRecordController.deletePrescription);

// ==================== REPORTS ====================
router.route('/report')
  .post(restrictTo('ADMIN', 'DOCTOR'), medicalRecordController.createReport);

router.route('/report/:id')
  .get(restrictTo('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT'), medicalRecordController.getReportById)
  .put(restrictTo('ADMIN', 'DOCTOR'), medicalRecordController.updateReport)
  .delete(restrictTo('ADMIN', 'DOCTOR'), medicalRecordController.deleteReport);

export default router;