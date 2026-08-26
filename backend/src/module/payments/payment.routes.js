import express from 'express';
import * as paymentController from './payment.controller.js';
import{paymentSchema, getPaymentQuerySchema,updatePaymentSchema,refundPaymentSchema} from './payment.schema.js';
import { validate } from '../../middleware/validateMiddleware.js';
import {verifyToken,authorize} from '../../middleware/authMiddleware.js';
import { ROLES } from '../../constans/roles.js';
const router = express.Router();
router.use(verifyToken); // Apply verifyToken middleware to all routes

//create payment
router.post('/',authorize(ROLES.ADMIN,ROLES.RECEPTIONIST),validate(paymentSchema),paymentController.createaPayment);

// get all payments (Admin,docotr, receptionist)
router.get('/',authorize(ROLES.ADMIN,ROLES.DOCTOR,ROLES.RECEPTIONIST),validate(getPaymentQuerySchema),paymentController.getAllPayments);

// get payment by bill id (Admin,docotr, receptionist)
router.get('/bill/:billId',authorize(ROLES.ADMIN,ROLES.DOCTOR,ROLES.RECEPTIONIST),paymentController.getPaymentByBillId);

// update payment (Admin only)
router.put('/:id',authorize(ROLES.ADMIN),validate(updatePaymentSchema),paymentController.updatePayment);

// refund payment (Admin only)
router.post('/:id/refund',authorize(ROLES.ADMIN),validate(refundPaymentSchema),paymentController.refundPayment);
// get payment history(Admin,patient, receptionist)
router.get('/history/:patientId',authorize(ROLES.ADMIN,ROLES.PATIENT,ROLES.RECEPTIONIST),paymentController.getPatientPaymentHistory);



export  default router;
