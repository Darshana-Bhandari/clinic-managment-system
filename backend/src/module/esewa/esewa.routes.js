import express from 'express';
import { z } from 'zod';
import * as esewaController from './esewa.controller.js';
import { validate } from '../../middleware/validateMiddleware.js';
import { verifyToken, authorize } from '../../middleware/authMiddleware.js';
import { ROLES } from '../../constans/roles.js';

const router = express.Router();

const initiateSchema = z.object({
  paymentType: z.enum(['APPOINTMENT', 'BILL'], {
    required_error: 'paymentType is required',
    invalid_type_error: 'paymentType must be APPOINTMENT or BILL',
  }),
  referenceId: z.string().min(1, 'referenceId is required'),
  amountOverride: z.number().positive('amountOverride must be a positive number').optional(),
  customerName: z.string().max(150, 'Name too long').optional(),
  customerEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  customerPhone: z.string().max(20, 'Phone too long').optional(),
});

const verifySchema = z.object({
  data: z.string().min(1, 'data is required').optional(),
  transaction_uuid: z.string().min(1, 'transaction_uuid is required').optional(),
  amount: z.string().or(z.number()).optional(),
});

router.get('/config', esewaController.getEsewaConfig);

router.get('/success', esewaController.handleCallback);
router.post('/success', esewaController.handleCallback);
router.get('/failure', esewaController.handleCallback);
router.post('/failure', esewaController.handleCallback);

router.use(verifyToken);

router.post(
  '/initiate',
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.PATIENT, ROLES.DOCTOR),
  validate(initiateSchema),
  esewaController.initiatePayment
);

router.post(
  '/verify',
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.PATIENT, ROLES.DOCTOR),
  validate(verifySchema),
  esewaController.verifyPayment
);

router.get(
  '/status/:transaction_uuid',
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.PATIENT, ROLES.DOCTOR),
  esewaController.getPaymentStatus
);

export default router;