import express from 'express';
import * as paymentController from './payment.controller.js';
import { verifyToken, authorize } from '../../middleware/authMiddleware.js';
import { validate } from '../../middleware/validateMiddleware.js';
import { ROLES } from '../../constans/roles.js';
import {
  strictAuthLimiter,
  paymentInitiateLimiter,
  paymentVerifyLimiter,
} from '../../middleware/rateLimiter.js';
import {
  createPaymentSchema,
  updatePaymentSchema,
  refundPaymentSchema,
} from './payment.schema.js';

const router = express.Router();

router.use(verifyToken);

// Summary + Transactions (admin/staff) — place before `/:id` to avoid clash
router.get(
  '/summary',
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST),
  paymentController.getPaymentSummary,
);

router.get(
  '/transactions',
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR),
  paymentController.getTransactionHistory,
);

router.get(
  '/transactions/export/csv',
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST),
  paymentController.downloadTransactionsCSV,
);

// Create payment (manual cash / POS record)
router.post(
  '/',
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST),
  paymentInitiateLimiter,
  validate(createPaymentSchema),
  paymentController.createPayment,
);

// Patient-level history — before /:id
router.get(
  '/patient/:patientId',
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.PATIENT),
  paymentController.getPatientPaymentHistory,
);

// Payments for a single bill
router.get(
  '/bill/:billId',
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.PATIENT),
  paymentController.getPaymentByBillId,
);

// Single payment CRUD
router.get(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.PATIENT),
  paymentController.getPaymentById,
);

router.put(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST),
  validate(updatePaymentSchema),
  paymentController.updatePayment,
);

router.post(
  '/:id/refund',
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST),
  strictAuthLimiter,
  validate(refundPaymentSchema),
  paymentController.refundPayment,
);

export default router;