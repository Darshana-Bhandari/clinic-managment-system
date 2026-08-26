import {z} from "zod";


export const paymentSchema = z.object({
    billId:z.string().min(1,"Bill ID is required"),
    amount:z.number().positive("Amount must be a positive number"),
    method:z.enum(["CASH","KHALTI","ESEWA"],"Payment method must be one of CASH, KHALTI, or ESEWA"),
    transactionId:z.string().optional(),
    note:z.string().max(500,"Note cannot exceed 500 characters").optional(),

});



// update payment schema
export const updatePaymentSchema = z.object({
    amount:z.number().positive("Amount must be a positive number").optional(),
    method:z.enum(["CASH","KHALTI","ESEWA"],"Payment method must be one of CASH, KHALTI, or ESEWA").optional(),
    transactionId:z.string().optional(),
    note:z.string().max(500,"Note cannot exceed 500 characters").optional(),
    status:z.enum(["PENDING","COMPLETED","FAILED"],"Payment status must be one of PENDING, COMPLETED, or FAILED").optional(),

});

// refund payment schema
export const refundPaymentSchema = z.object({
    amount:z.number().positive("Amount must be a positive number"),
    reason:z.string().max(500,"Reason cannot exceed 500 characters").optional(),
});

// get payment query schema
export const getPaymentQuerySchema = z.object({
    page:z.number().positive("Page must be a positive number").optional(),
    limit:z.number().positive("Limit must be a positive number").optional(),
    billId:z.string().optional(),
    patientId:z.string().optional(),
    status:z.enum(["PENDING","COMPLETED","FAILED"],"Payment status must be one of PENDING, COMPLETED, or FAILED").optional(),
    method:z.enum(["CASH","KHALTI","ESEWA"],"Payment method must be one of CASH, KHALTI, or ESEWA").optional(),
    fromDate:z.string().optional(),
    toDate:z.string().optional(),
    search:z.string().optional(),
});