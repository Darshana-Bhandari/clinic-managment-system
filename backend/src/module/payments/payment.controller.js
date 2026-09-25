import * as paymentService from './payment.service.js';
import {
  successResponse,
  errorResponse,
  createdResponse,
  notFoundResponse,
  conflictResponse,
} from '../../utils/response.js';

export const createPayment = async (req, res) => {
  try {
    const payment = await paymentService.createPayment(req.body);
    return createdResponse(res, payment, 'Payment created successfully');
  } catch (error) {
    if (error.message === 'Bill not found') {
      return notFoundResponse(res, 'Bill not found');
    }
    if (
      error.message.includes('cannot process') ||
      error.message.includes('already paid') ||
      error.message.includes('Cannot make payment') ||
      error.message.includes('exceeds')
    ) {
      return conflictResponse(res, error.message);
    }
    return errorResponse(res, error.message || 'Failed to create payment');
  }
};

export const createaPayment = createPayment;

export const getAllPayments = async (req, res) => {
  try {
    const page = parseInt(req.query.page || 1);
    const limit = parseInt(req.query.limit || 10);
    const filters = {
      billId: req.query.billId,
      patientId: req.query.patientId,
      status: req.query.status,
      method: req.query.method,
      fromDate: req.query.fromDate,
      toDate: req.query.toDate,
    };
    const result = await paymentService.getAllPayments(page, limit, filters);
    return successResponse(res, result, 'Payments fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to get all payments');
  }
};

export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await paymentService.getPaymentById(id);
    if (!payment) return notFoundResponse(res, 'Payment not found');
    return successResponse(res, payment, 'Payment fetched successfully');
  } catch (error) {
    if (error.message === 'Payment not found') return notFoundResponse(res, error.message);
    return errorResponse(res, error.message || 'Failed to get payment by ID');
  }
};

export const getPaymentByBillId = async (req, res) => {
  try {
    const { billId } = req.params;
    const page = parseInt(req.query.page || 1);
    const limit = parseInt(req.query.limit || 10);
    const payment = await paymentService.getPaymentByBillId(billId, page, limit);
    if (!payment) {
      return notFoundResponse(res, 'Payment not found for the given bill ID');
    }
    return successResponse(res, payment, 'Payments for bill fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to get payments by bill ID');
  }
};

export const getPaymentSummary = async (req, res) => {
  try {
    const filters = {
      fromDate: req.query.fromDate,
      toDate: req.query.toDate,
    };
    const summary = await paymentService.getPaymentSummary(filters);
    return successResponse(res, summary, 'Payment summary fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to get payment summary');
  }
};

export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const paymentData = req.body;
    const updatedPayment = await paymentService.updatePayment(id, paymentData);
    if (!updatedPayment) return notFoundResponse(res, 'Payment not found');
    return successResponse(res, updatedPayment, 'Payment updated successfully');
  } catch (error) {
    if (error.message === 'Payment not found') return notFoundResponse(res, error.message);
    if (error.message.includes('already refunded') || error.message.includes('Cannot')) {
      return conflictResponse(res, error.message);
    }
    return errorResponse(res, error.message || 'Failed to update payment');
  }
};

export const getPatientPaymentHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const page = parseInt(req.query.page || 1);
    const limit = parseInt(req.query.limit || 10);
    const result = await paymentService.getPatientPaymentHistory(patientId, page, limit);
    return successResponse(res, result, 'Patient payment history fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to get patient payment history');
  }
};

export const refundPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const refundData = req.body;
    const refundedPayment = await paymentService.refundPayment(id, refundData);
    return successResponse(res, refundedPayment, 'Payment refunded successfully');
  } catch (error) {
    if (error.message === 'Payment not found') return notFoundResponse(res, 'Payment not found');
    if (error.message.includes('already refunded') || error.message.includes('Cannot refund')) {
      return conflictResponse(res, error.message);
    }
    return errorResponse(res, error.message || 'Failed to refund payment');
  }
};

export const getTransactionHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page || 1);
    const limit = parseInt(req.query.limit || 50);
    const filters = {
      method: req.query.method,
      status: req.query.status,
      billId: req.query.billId,
      appointmentId: req.query.appointmentId,
      patientId: req.query.patientId,
      fromDate: req.query.fromDate,
      toDate: req.query.toDate,
      transactionId: req.query.transactionId,
      search: req.query.search,
    };
    const result = await paymentService.getTransactionHistory(filters, page, limit);
    return successResponse(res, result, 'Transaction history fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to fetch transaction history');
  }
};

export const downloadTransactionsCSV = async (req, res) => {
  try {
    const filters = {
      method: req.query.method,
      status: req.query.status,
      billId: req.query.billId,
      patientId: req.query.patientId,
      fromDate: req.query.fromDate,
      toDate: req.query.toDate,
    };
    const csv = await paymentService.getTransactionsCSV(filters);
    const filename = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.send('\uFEFF' + csv);
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to export CSV');
  }
};

export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const actorId = req.user?.id || null;
    const result = await paymentService.deletePayment(id, actorId);
    return successResponse(res, result, 'Payment deleted successfully');
  } catch (error) {
    if (error.message === 'Payment not found') return notFoundResponse(res, error.message);
    return errorResponse(res, error.message || 'Failed to delete payment');
  }
};

export default {
  createaPayment,
  getAllPayments,
  getPaymentById,
  getPaymentByBillId,
  getPaymentSummary,
  updatePayment,
  getPatientPaymentHistory,
  refundPayment,
  getTransactionHistory,
  downloadTransactionsCSV,
  deletePayment,
};