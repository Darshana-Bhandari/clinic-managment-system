import * as doctorService from './doctor.service.js';
import { 
  successResponse, 
  errorResponse,
  createdResponse,
  notFoundResponse,
  conflictResponse,
  handleZodError,
} from '../../utils/response.js';
import { MESSAGES } from '../../constans/messages.js';

// ==================== CREATE DOCTOR ====================
export const createDoctor = async (req, res) => {
  try {
    const doctor = await doctorService.createDoctor(req.body);
    return createdResponse(res, doctor, 'Doctor created successfully');
  } catch (error) {
    console.error('Create doctor error:', error);
    
    if (error.message === 'User not found') {
      return notFoundResponse(res, error.message);
    }
    if (error.message === 'Doctor profile already exists for this user') {
      return conflictResponse(res, error.message);
    }
    if (error.message === 'User is already registered as a patient') {
      return conflictResponse(res, error.message);
    }
    if (error.message === 'License number already exists') {
      return conflictResponse(res, error.message);
    }
    
    return errorResponse(res, error.message || 'Failed to create doctor');
  }
};

// ==================== GET ALL DOCTORS ====================
export const getAllDoctors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const specialization = req.query.specialization;
    const hospital = req.query.hospital;
    const minRating = req.query.minRating ? parseFloat(req.query.minRating) : null;

    const result = await doctorService.getAllDoctors(page, limit, search, specialization, hospital, minRating);
    return successResponse(res, result, 'Doctors fetched successfully');
  } catch (error) {
    console.error('Get all doctors error:', error);
    return errorResponse(res, error.message || 'Failed to get doctors');
  }
};

// ==================== GET DOCTOR BY ID ====================
export const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await doctorService.getDoctorById(id);
    return successResponse(res, doctor, 'Doctor fetched successfully');
  } catch (error) {
    console.error('Get doctor by ID error:', error);
    if (error.message === 'Doctor not found') {
      return notFoundResponse(res, error.message);
    }
    return errorResponse(res, error.message || 'Failed to get doctor');
  }
};

// ==================== GET DOCTOR BY USER ID ====================
export const getDoctorByUserId = async (req, res) => {
  try {
    const userId = req.user.id;
    const doctor = await doctorService.getDoctorByUserId(userId);
    return successResponse(res, doctor, 'Doctor fetched successfully');
  } catch (error) {
    console.error('Get doctor by user ID error:', error);
    if (error.message === 'Doctor not found for this user') {
      return notFoundResponse(res, error.message);
    }
    return errorResponse(res, error.message || 'Failed to get doctor');
  }
};

// ==================== UPDATE DOCTOR ====================
export const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await doctorService.updateDoctor(id, req.body);
    return successResponse(res, doctor, 'Doctor updated successfully');
  } catch (error) {
    console.error('Update doctor error:', error);
    if (error.message === 'Doctor not found') {
      return notFoundResponse(res, error.message);
    }
    if (error.message === 'License number already exists') {
      return conflictResponse(res, error.message);
    }
    return errorResponse(res, error.message || 'Failed to update doctor');
  }
};

// ==================== DELETE DOCTOR ====================
export const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await doctorService.deleteDoctor(id);
    return successResponse(res, null, result.message);
  } catch (error) {
    console.error('Delete doctor error:', error);
    if (error.message === 'Doctor not found') {
      return notFoundResponse(res, error.message);
    }
    return errorResponse(res, error.message || 'Failed to delete doctor');
  }
};

// ==================== RATE DOCTOR ====================
export const rateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    const userId = req.user.id;

    const doctor = await doctorService.rateDoctor(id, userId, rating, review);
    return successResponse(res, doctor, 'Doctor rated successfully');
  } catch (error) {
    console.error('Rate doctor error:', error);
    if (error.message === 'Doctor not found') {
      return notFoundResponse(res, error.message);
    }
    if (error.message === 'Patient not found') {
      return notFoundResponse(res, error.message);
    }
    if (error.message === 'You can only rate doctors after a completed appointment') {
      return errorResponse(res, error.message, 400);
    }
    return errorResponse(res, error.message || 'Failed to rate doctor');
  }
};

// ==================== GET DOCTOR STATISTICS ====================
export const getDoctorStatistics = async (req, res) => {
  try {
    const { id } = req.params;
    const stats = await doctorService.getDoctorStatistics(id);
    return successResponse(res, stats, 'Doctor statistics fetched successfully');
  } catch (error) {
    console.error('Get doctor statistics error:', error);
    if (error.message === 'Doctor not found') {
      return notFoundResponse(res, error.message);
    }
    return errorResponse(res, error.message || 'Failed to get doctor statistics');
  }
};

// ==================== GET DOCTOR AVAILABILITY ====================
export const getDoctorAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const availability = await doctorService.getDoctorAvailability(id);
    return successResponse(res, availability, 'Doctor availability fetched successfully');
  } catch (error) {
    console.error('Get doctor availability error:', error);
    if (error.message === 'Doctor not found') {
      return notFoundResponse(res, error.message);
    }
    return errorResponse(res, error.message || 'Failed to get doctor availability');
  }
};