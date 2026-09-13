import express from 'express';
import { z } from 'zod';
import * as khaltiController from './khalti.controller.js';
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
  pidx: z.string().min(1, 'pidx is required'),
});

router.get('/config', khaltiController.getKhaltiConfig);

router.post('/callback', khaltiController.callbackHandler);
router.get('/callback', khaltiController.callbackHandler);

router.use(verifyToken);

router.post(
  '/initiate',
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.PATIENT, ROLES.DOCTOR),
  validate(initiateSchema),
  khaltiController.initiatePayment
);

router.post(
  '/verify',
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.PATIENT, ROLES.DOCTOR),
  validate(verifySchema),
  khaltiController.verifyPayment
);

router.get(
  '/verify/:pidx',
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.PATIENT, ROLES.DOCTOR),
  khaltiController.verifyPayment
);

router.get(
  '/status/:pidx',
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.PATIENT, ROLES.DOCTOR),
  khaltiController.getPaymentStatus
);

export default router;