import { z } from 'zod';

// Book Appointment Schema
export const bookAppointmentSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  doctorId: z.string().min(1, 'Doctor ID is required'),
  date: z.string().datetime('Invalid date format'),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  type: z.string().optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  symptoms: z.array(z.string()).optional(),
});

// Update Appointment Schema
export const updateAppointmentSchema = z.object({
  date: z.string().datetime('Invalid date format').optional(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
  type: z.string().optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  symptoms: z.array(z.string()).optional(),
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW']).optional(),
  diagnosis: z.string().optional(),
  prescription: z.string().optional(),
  followUpDate: z.string().datetime('Invalid date format').optional(),
});

// Cancel Appointment Schema
export const cancelAppointmentSchema = z.object({
  reason: z.string().min(1, 'Cancellation reason is required').max(500, 'Reason cannot exceed 500 characters'),
});

// Get Appointments Query Schema
export const getAppointmentsQuerySchema = z.object({
  page: z.string().optional().transform(Number).default('1'),
  limit: z.string().optional().transform(Number).default('10'),
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW']).optional(),
  patientId: z.string().optional(),
  doctorId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().optional(),
});

export const appointmentIdSchema = z.object({
  id: z.string().min(1, 'Appointment ID is required'),
});

// Complete Appointment Schema (for doctor)
export const completeAppointmentSchema = z.object({
  diagnosis: z.string().optional(),
  prescription: z.string().optional(),
  followUpDate: z.string().datetime('Invalid date format').optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});
