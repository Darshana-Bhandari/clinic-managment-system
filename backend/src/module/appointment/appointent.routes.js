import express from 'express';
import * as appointmentController from './appointment.controller.js';
import { 
  bookAppointmentSchema, 
  updateAppointmentSchema,
  cancelAppointmentSchema,
  
} from './appointment.schema.js';
import {validate} from '../../middleware/validateMiddleware.js';
import { verifyToken, authorize } from '../../middleware/authMiddleware.js';
import { ROLES } from '../../constans/roles.js';

const router = express.Router();

router.use(verifyToken);

// Book appointment (Patient only)
router.post(
  '/',
  authorize(ROLES.PATIENT),
  validate(bookAppointmentSchema),
  appointmentController.bookAppointment
);

// Get all appointments (Admin, Doctor, Receptionist)
router.get(
  '/',
  authorize(ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST),
  appointmentController.getAllAppointments
);

// Get appointment by ID
router.get(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.DOCTOR, ROLES.PATIENT, ROLES.RECEPTIONIST),
  appointmentController.getAppointmentById
);

// Update appointment (Admin, Patient)
router.put(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.PATIENT),
  validate(updateAppointmentSchema),
  appointmentController.updateAppointment
);

// Cancel appointment (Admin, Patient)
router.patch(
  '/:id/cancel',
  authorize(ROLES.ADMIN, ROLES.PATIENT),
  validate(cancelAppointmentSchema),
  appointmentController.cancelAppointment
);

export default router;