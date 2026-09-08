import * as appointmentService from './appointment.service.js';
import { successResponse, errorResponse, createdResponse, notFoundResponse, conflictResponse } from '../../utils/response.js';

// Book Appointment
export const bookAppointment = async (req, res) => {
  try {
    const appointment = await appointmentService.bookAppointment(req.body);
    return createdResponse(res, appointment, 'Appointment booked successfully');
  } catch (error) {
    if (error.message === 'Patient not found' || error.message === 'Doctor not found') {
      return notFoundResponse(res, error.message);
    }
    if (error.message === 'This time slot is already booked') {
      return conflictResponse(res, error.message);
    }
    return errorResponse(res, error.message || 'Failed to book appointment');
  }
};

// Get All Appointments
export const getAllAppointments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {
      status: req.query.status,
      patientId: req.query.patientId,
      doctorId: req.query.doctorId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const result = await appointmentService.getAllAppointments(page, limit, filters);
    return successResponse(res, result, 'Appointments fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to get appointments');
  }
};

// Get Appointment by ID
export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await appointmentService.getAppointmentById(id);
    return successResponse(res, appointment, 'Appointment fetched successfully');
  } catch (error) {
    if (error.message === 'Appointment not found') {
      return notFoundResponse(res, error.message);
    }
    return errorResponse(res, error.message || 'Failed to get appointment');
  }
};

// Update Appointment
export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await appointmentService.updateAppointment(id, req.body);
    return successResponse(res, appointment, 'Appointment updated successfully');
  } catch (error) {
    if (error.message === 'Appointment not found') {
      return notFoundResponse(res, error.message);
    }
    if (error.message.includes('Cannot update') || error.message === 'This time slot is already booked') {
      return conflictResponse(res, error.message);
    }
    return errorResponse(res, error.message || 'Failed to update appointment');
  }
};

// Cancel Appointment
export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const appointment = await appointmentService.cancelAppointment(id, reason);
    return successResponse(res, appointment, 'Appointment cancelled successfully');
  } catch (error) {
    if (error.message === 'Appointment not found') {
      return notFoundResponse(res, error.message);
    }
    if (error.message.includes('Cannot cancel') || error.message === 'Appointment is already cancelled') {
      return conflictResponse(res, error.message);
    }
    return errorResponse(res, error.message || 'Failed to cancel appointment');
  }
};