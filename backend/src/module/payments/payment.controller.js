import * as paymentService from './payment.service.js';
import {successResponse, errorResponse, createdResponse,notFoundResponse,conflictResponse} from '../../utils/response.js';

// create payment
export const createaPayment = async (req, res) =>{
    try{
        const payment =await paymentService.createPayment(req.body);
        return createdResponse(res,payment,"Payment created successfully");

    }
    catch (error) {
        if(error.message=== "Bill not found"){
            return notFoundResponse(res, "Bill not found");
        }
        return notFoundResponse(res, error.message || "failed to create payment");
        if(error.message.inlcudes("cannot process")|| error.message.includes("already paid")){
            return conflictResponse(res, error.message);
        }
        
        return errorResponse(res, error.message || 'failed to create payment');
    }
}

// get all payments
export const getAllPayments =async (req, res)=>{
    try{
        const page = parseInt(req.query.page || 1);
        const limit = parseInt(req.query.limit || 10);
       const filters ={
        billId: req.query.billId,
        patientId: req.query.patientId,
        status: req.query.status,
        method: req.query.method,
        fromDate: req.query.fromDate,
        toDate: req.query.toDate,
       }
        const result = await paymentService.getAllPayments(page, limit, filters);
        return successResponse(res, result, 'payments fetched successfully');

       }
        

    
    catch (error) {
        return errorResponse(res, error.message || 'failed to get all payments');
    }
}

// get payment by id

//get payment by bill
export const getPaymentByBillId = async (req, res) => {
    try {
        const { billId } = req.params;
        const payment = await paymentService.getPaymentByBillId(billId);
        if (!payment) {
            return notFoundResponse(res, 'Payment not found for the given bill ID');
        }
        return successResponse(res, payment, 'Payment fetched successfully');
    } catch (error) {
        return errorResponse(res, error.message || 'failed to get payment by bill ID');
    }
}


// get payment summary
export const getPaymentSummary = async (req, res) => {
    try {
        const summary = await paymentService.getPaymentSummary();
        return successResponse(res, summary, 'Payment summary fetched successfully');
    } catch (error) {
        return errorResponse(res, error.message || 'failed to get payment summary');
    }
}


//update payment
export const updatePayment = async (req, res)=>{
    try {
        const { id } = req.params;
        const paymentData = req.body;
        const updatedPayment = await paymentService.updatePayment(id, paymentData);
        if (!updatedPayment) {
            return notFoundResponse(res, 'Payment not found');
        }
        return successResponse(res, updatedPayment, 'Payment updated successfully');
    } catch (error) {
        return errorResponse(res, error.message || 'failed to update payment');
    }
}


// get  patient payment history
export const getPatientPaymentHistory = async (req, res) => {
    try {
        const { patientId } = req.params;
        const page = parseInt(req.query.page || 1);
        const limit = parseInt(req.query.limit || 10);
        const result = await paymentService.getPatientPaymentHistory(patientId, page, limit);
        return successResponse(res, result, 'Patient payment history fetched successfully');
    } catch (error) {
        return errorResponse(res, error.message || 'failed to get patient payment history');
    }
}

// refund payment
export const refundPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const refundData = req.body;
        const refundedPayment = await paymentService.refundPayment(id, refundData);
        return successResponse(res, refundedPayment, 'Payment refunded successfully');
    } catch (error) {
        if (error.message === "Payment not found") {
            return notFoundResponse(res, 'Payment not found');
        }
        if (error.message.includes("already refunded") || error.message.includes("Cannot refund")) {
            return conflictResponse(res, error.message);
        }
        return errorResponse(res, error.message || 'failed to refund payment');
    }
}