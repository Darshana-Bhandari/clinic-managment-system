import * as patientService from './patient.service.js';
import { conflictResponse, createdResponse, errorResponse, notFoundResponse, successResponse } from '../../utils/response.js';

// ==================== CREATE PATIENT ====================
export const createPatient = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return errorResponse(res, 'Unauthorized: user not authenticated', 401);

    const patient = await patientService.createPatient({ userId, ...req.body }, req.files || []);
    return createdResponse(res, patient, 'Patient created successfully');
  } catch (error) {
    console.error('Create patient error:', error);
    if (error.message === 'User not found') return notFoundResponse(res, error.message);
    if (error.message === 'Patient profile already exists for this user') return conflictResponse(res, error.message);
    return errorResponse(res, error.message || 'Failed to create patient');
  }
};

// ==================== GET ALL PATIENTS ====================
export const getAllPatients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { search, gender, bloodGroup } = req.query;

    const result = await patientService.getAllPatients(page, limit, search, gender, bloodGroup);
    return successResponse(res, result, 'Patients fetched successfully');
  } catch (error) {
    console.error('Get all patients error:', error);
    return errorResponse(res, error.message || 'Failed to get patients');
  }
};

// ==================== GET PATIENT BY ID ====================
export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await patientService.getPatientById(id);
    return successResponse(res, patient, 'Patient fetched successfully');
  } catch (error) {
    console.error('Get patient by ID error:', error);
    if (error.message === 'Patient not found') return notFoundResponse(res, error.message);
    return errorResponse(res, error.message || 'Failed to get patient');
  }
};

// ==================== GET PATIENT BY USER ID ====================
export const getPatientByUserId = async (req, res) => {
  try {
    const userId = req.user.id;
    const patient = await patientService.getPatientByUserId(userId);
    return successResponse(res, patient, 'Patient fetched successfully');
  } catch (error) {
    console.error('Get patient by userId error:', error);
    if (error.message === 'Patient not found for this user') return notFoundResponse(res, error.message);
    return errorResponse(res, error.message || 'Failed to get patient');
  }
};

// ==================== UPDATE PATIENT ====================
export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await patientService.updatePatient(id, req.body, req.files || []);
    return successResponse(res, patient, 'Patient updated successfully');
  } catch (error) {
    console.error('Update patient error:', error);
    if (error.message === 'Patient not found') return notFoundResponse(res, error.message);
    return errorResponse(res, error.message || 'Failed to update patient');
  }
};

// ==================== DELETE PATIENT ====================
export const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await patientService.deletePatient(id);
    return successResponse(res, null, result.message);
  } catch (error) {
    console.error('Delete patient error:', error);
    if (error.message === 'Patient not found') return notFoundResponse(res, error.message);
    return errorResponse(res, error.message || 'Failed to delete patient');
  }
};

// ==================== GET PATIENT STATISTICS ====================
export const getPatientStatistics = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await patientService.getPatientStatistics(id);
    return successResponse(res, result, 'Patient statistics fetched successfully');
  } catch (error) {
    console.error('Get patient statistics error:', error);
    if (error.message === 'Patient not found') return notFoundResponse(res, error.message);
    return errorResponse(res, error.message || 'Failed to get patient statistics');
  }
};