import * as medicalRecordService from './medicalRecord.service.js';
import { successResponse, errorResponse, createdResponse, notFoundResponse } from '../../utils/response.js';

// ==================== MEDICAL RECORD CONTROLLERS ====================

export const createMedicalRecord = async (req, res) => {
  try {
    const medicalRecord = await medicalRecordService.createMedicalRecord(req.body);
    return createdResponse(res, medicalRecord, 'Medical record created successfully');
  } catch (error) {
    console.error('Create medical record error:', error);
    if (error.message === 'patient not found' || error.message === 'doctor not found') {
      return notFoundResponse(res, error.message);
    }
    return errorResponse(res, error.message || 'Failed to create medical record');
  }
};

export const getMedicalRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    const medicalRecord = await medicalRecordService.getMedicalRecordById(id);
    return successResponse(res, medicalRecord, 'Medical record fetched successfully');
  } catch (error) {
    console.error('Get medical record error:', error);
    if (error.message === 'medical record not found') return notFoundResponse(res, error.message);
    return errorResponse(res, error.message || 'Failed to get medical record');
  }
};

export const getAllMedicalRecords = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {
      patientId: req.query.patientId,
      doctorId: req.query.doctorId,
      fromDate: req.query.fromDate,
      toDate: req.query.toDate,
      search: req.query.search,
    };
    const result = await medicalRecordService.getAllMedicalRecords(page, limit, filters);
    return successResponse(res, result, 'Medical records fetched successfully');
  } catch (error) {
    console.error('Get all medical records error:', error);
    return errorResponse(res, error.message || 'Failed to get medical records');
  }
};

export const updateMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedRecord = await medicalRecordService.updateMedicalRecordById(id, req.body);
    return successResponse(res, updatedRecord, 'Medical record updated successfully');
  } catch (error) {
    console.error('Update medical record error:', error);
    if (error.message === 'medical record not found') return notFoundResponse(res, error.message);
    return errorResponse(res, error.message || 'Failed to update medical record');
  }
};

export const deleteMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    await medicalRecordService.deleteMedicalRecordById(id);
    return successResponse(res, null, 'Medical record deleted successfully');
  } catch (error) {
    console.error('Delete medical record error:', error);
    if (error.message === 'medical record not found') return notFoundResponse(res, error.message);
    return errorResponse(res, error.message || 'Failed to delete medical record');
  }
};

// ==================== PRESCRIPTION CONTROLLERS ====================

export const createPrescription = async (req, res) => {
  try {
    const prescription = await medicalRecordService.createPrescription(req.body);
    return createdResponse(res, prescription, 'Prescription created successfully');
  } catch (error) {
    console.error('Create prescription error:', error);
    if (error.message === 'medical record not found') return notFoundResponse(res, error.message);
    return errorResponse(res, error.message || 'Failed to create prescription');
  }
};

export const getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const prescription = await medicalRecordService.getPrescriptionById(id);
    return successResponse(res, prescription, 'Prescription fetched successfully');
  } catch (error) {
    console.error('Get prescription error:', error);
    if (error.message === 'prescription not found') return notFoundResponse(res, error.message);
    return errorResponse(res, error.message || 'Failed to get prescription');
  }
};

export const updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedPrescription = await medicalRecordService.updatePrescription(id, req.body);
    return successResponse(res, updatedPrescription, 'Prescription updated successfully');
  } catch (error) {
    console.error('Update prescription error:', error);
    if (error.message === 'prescription not found') return notFoundResponse(res, error.message);
    return errorResponse(res, error.message || 'Failed to update prescription');
  }
};

export const deletePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await medicalRecordService.prescriptiondelete(id);
    return successResponse(res, null, result.message);
  } catch (error) {
    console.error('Delete prescription error:', error);
    if (error.message === 'Prescription not found') return notFoundResponse(res, error.message);
    return errorResponse(res, error.message || 'Failed to delete prescription');
  }
};

// ==================== REPORT CONTROLLERS ====================

export const createReport = async (req, res) => {
  try {
    // req.file is the single uploaded file (field name: 'file')
    const report = await medicalRecordService.createReport(req.body, req.file || null);
    return createdResponse(res, report, 'Report created successfully');
  } catch (error) {
    console.error('Create report error:', error);
    if (error.message === 'medical record not found') return notFoundResponse(res, error.message);
    return errorResponse(res, error.message || 'Failed to create report');
  }
};

export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await medicalRecordService.getReportById(id);
    return successResponse(res, report, 'Report fetched successfully');
  } catch (error) {
    console.error('Get report error:', error);
    if (error.message === 'Report not found') return notFoundResponse(res, error.message);
    return errorResponse(res, error.message || 'Failed to get report');
  }
};

export const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    // req.file is the replacement file (optional)
    const updatedReport = await medicalRecordService.updateReport(id, req.body, req.file || null);
    return successResponse(res, updatedReport, 'Report updated successfully');
  } catch (error) {
    console.error('Update report error:', error);
    if (error.message === 'Report not found') return notFoundResponse(res, error.message);
    return errorResponse(res, error.message || 'Failed to update report');
  }
};

export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await medicalRecordService.deleteReport(id);
    return successResponse(res, null, result.message);
  } catch (error) {
    console.error('Delete report error:', error);
    if (error.message === 'Report not found') return notFoundResponse(res, error.message);
    return errorResponse(res, error.message || 'Failed to delete report');
  }
};

// ==================== PATIENT MEDICAL HISTORY ====================

export const getPatientMedicalHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const history = await medicalRecordService.getPatientMedicalHistory(patientId, page, limit);
    return successResponse(res, history, 'Patient medical history fetched successfully');
  } catch (error) {
    console.error('Get patient history error:', error);
    return errorResponse(res, error.message || 'Failed to fetch patient history');
  }
};