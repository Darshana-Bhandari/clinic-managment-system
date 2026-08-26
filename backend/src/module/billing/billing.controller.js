import * as billingService from "./billing.service.js";
import {
    successResponse,
    createdResponse,
    errorResponse,
    notFoundResponse,
    serverErrorResponse,
} from "../../utils/response.js";
import { STATUS_CODES } from "../../constans/statusCodes.js";

// ─────────────────────────────────────────────────────────────────────────────
// GENERATE BILL
// POST /api/billing
// ─────────────────────────────────────────────────────────────────────────────

export const generateBill = async (req, res) => {
    try {
        const bill = await billingService.generateBill(req.body);
        return createdResponse(res, bill, "Bill generated successfully");
    } catch (error) {
        console.error("[generateBill]", error.message);
        if (error.message === "Patient not found" || error.message === "Appointment not found") {
            return notFoundResponse(res, error.message);
        }
        return errorResponse(res, error.message, STATUS_CODES.BAD_REQUEST);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET ALL BILLS
// GET /api/billing?page=&limit=&status=&patientId=&fromDate=&toDate=&search=
// ─────────────────────────────────────────────────────────────────────────────

export const getAllBills = async (req, res) => {
    try {
        const { page = "1", limit = "10", ...filters } = req.query;
        const result = await billingService.getAllBills(Number(page), Number(limit), filters);
        return successResponse(res, result, "Bills fetched successfully");
    } catch (error) {
        console.error("[getAllBills]", error.message);
        return serverErrorResponse(res, error.message);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET BILL BY ID
// GET /api/billing/:id
// ─────────────────────────────────────────────────────────────────────────────

export const getBillById = async (req, res) => {
    try {
        const bill = await billingService.getBillById(req.params.id);
        return successResponse(res, bill, "Bill fetched successfully");
    } catch (error) {
        console.error("[getBillById]", error.message);
        if (error.message === "Bill not found") return notFoundResponse(res, error.message);
        return serverErrorResponse(res, error.message);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET BILL BY INVOICE NUMBER
// GET /api/billing/invoice/:invoiceNumber
// ─────────────────────────────────────────────────────────────────────────────

export const getBillByInvoiceNumber = async (req, res) => {
    try {
        const bill = await billingService.getBillByInvoiceNumber(req.params.invoiceNumber);
        return successResponse(res, bill, "Bill fetched successfully");
    } catch (error) {
        console.error("[getBillByInvoiceNumber]", error.message);
        if (error.message.includes("not found")) return notFoundResponse(res, error.message);
        return serverErrorResponse(res, error.message);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE BILL
// PUT /api/billing/:id
// ─────────────────────────────────────────────────────────────────────────────

export const updateBill = async (req, res) => {
    try {
        const updated = await billingService.updateBill(req.params.id, req.body);
        return successResponse(res, updated, "Bill updated successfully");
    } catch (error) {
        console.error("[updateBill]", error.message);
        if (error.message === "Bill not found") return notFoundResponse(res, error.message);
        return errorResponse(res, error.message, STATUS_CODES.BAD_REQUEST);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// CANCEL BILL
// PATCH /api/billing/:id/cancel
// ─────────────────────────────────────────────────────────────────────────────

export const cancelBill = async (req, res) => {
    try {
        const { reason } = req.body;
        const cancelledBy = req.user?.id;
        const cancelled = await billingService.cancelBill(req.params.id, reason, cancelledBy);
        return successResponse(res, cancelled, "Bill cancelled successfully");
    } catch (error) {
        console.error("[cancelBill]", error.message);
        if (error.message === "Bill not found") return notFoundResponse(res, error.message);
        return errorResponse(res, error.message, STATUS_CODES.BAD_REQUEST);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE BILL
// DELETE /api/billing/:id
// ─────────────────────────────────────────────────────────────────────────────

export const deleteBill = async (req, res) => {
    try {
        const deletedBy = req.user?.id;
        const result = await billingService.deleteBill(req.params.id, deletedBy);
        return successResponse(res, result, "Bill deleted successfully");
    } catch (error) {
        console.error("[deleteBill]", error.message);
        if (error.message === "Bill not found") return notFoundResponse(res, error.message);
        return errorResponse(res, error.message, STATUS_CODES.BAD_REQUEST);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// BILLING SUMMARY
// GET /api/billing/summary?fromDate=&toDate=
// ─────────────────────────────────────────────────────────────────────────────

export const getBillSummary = async (req, res) => {
    try {
        const summary = await billingService.getBillSummary(req.query);
        return successResponse(res, summary, "Billing summary fetched successfully");
    } catch (error) {
        console.error("[getBillSummary]", error.message);
        return serverErrorResponse(res, error.message);
    }
};