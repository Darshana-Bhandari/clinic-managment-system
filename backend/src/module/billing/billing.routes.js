import express from 'express';
import { verifyToken, authorize } from '../../middleware/authMiddleware.js';
import { validate } from '../../middleware/validateMiddleware.js';
import { ROLES } from '../../constans/roles.js';
import {
    generateBillSchema,
    updateBillSchema,
    cancelBillSchema,
} from './billing.schema.js';
import {
    generateBill,
    getAllBills,
    getBillById,
    getBillByInvoiceNumber,
    updateBill,
    cancelBill,
    deleteBill,
    getBillSummary,
} from './billing.controller.js';

const router = express.Router();

// All billing routes require a valid JWT
router.use(verifyToken);

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY  — must be before /:id to avoid route clash
// GET /api/billing/summary?fromDate=&toDate=
// ─────────────────────────────────────────────────────────────────────────────

router.get(
    '/summary',
    authorize(ROLES.ADMIN, ROLES.RECEPTIONIST),
    getBillSummary
);

// ─────────────────────────────────────────────────────────────────────────────
// INVOICE LOOKUP  — must be before /:id to avoid route clash
// GET /api/billing/invoice/:invoiceNumber
// ─────────────────────────────────────────────────────────────────────────────

router.get(
    '/invoice/:invoiceNumber',
    authorize(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.PATIENT),
    getBillByInvoiceNumber
);

// ─────────────────────────────────────────────────────────────────────────────
// BILL COLLECTION
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/billing
router.get(
    '/',
    authorize(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR),
    getAllBills
);

// POST /api/billing
router.post(
    '/',
    authorize(ROLES.ADMIN, ROLES.RECEPTIONIST),
    validate(generateBillSchema),
    generateBill
);

// ─────────────────────────────────────────────────────────────────────────────
// SINGLE BILL
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/billing/:id
router.get(
    '/:id',
    authorize(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.PATIENT),
    getBillById
);

// PUT /api/billing/:id
router.put(
    '/:id',
    authorize(ROLES.ADMIN, ROLES.RECEPTIONIST),
    validate(updateBillSchema),
    updateBill
);

// DELETE /api/billing/:id  (Admin only — UNPAID/CANCELLED bills only)
router.delete(
    '/:id',
    authorize(ROLES.ADMIN),
    deleteBill
);

// ─────────────────────────────────────────────────────────────────────────────
// BILL ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

// PATCH /api/billing/:id/cancel
router.patch(
    '/:id/cancel',
    authorize(ROLES.ADMIN, ROLES.RECEPTIONIST),
    validate(cancelBillSchema),
    cancelBill
);

export default router;