import * as invoiceService from './invoice.service.js';
import {
  successResponse,
  notFoundResponse,
  errorResponse,
} from '../../utils/response.js';

const handleInvoiceError = (res, error) => {
  console.error('[Invoice Controller]', error.message);
  if (error.message === 'Bill not found') return notFoundResponse(res, error.message);
  if (error.message === 'Payment record not found') return notFoundResponse(res, error.message);
  return errorResponse(res, error.message);
};

export const getInvoiceJSON = async (req, res) => {
  try {
    const result = await invoiceService.generateInvoiceJSON(req.params.id);
    return successResponse(res, result, 'Invoice data fetched successfully');
  } catch (error) {
    return handleInvoiceError(res, error);
  }
};

export const getInvoiceByInvoiceNumberJSON = async (req, res) => {
  try {
    const result = await invoiceService.generateInvoiceByInvoiceNumber(req.params.invoiceNumber);
    return successResponse(res, result, 'Invoice data fetched successfully');
  } catch (error) {
    return handleInvoiceError(res, error);
  }
};

export const getInvoiceHTML = async (req, res) => {
  try {
    const html = await invoiceService.renderInvoiceHTML(req.params.id);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="invoice-${req.params.id}.html"`,
    );
    return res.send(html);
  } catch (error) {
    console.error('[Invoice HTML]', error.message);
    if (error.message === 'Bill not found') return notFoundResponse(res, error.message);
    return errorResponse(res, error.message);
  }
};

export const downloadInvoiceHTML = async (req, res) => {
  try {
    const html = await invoiceService.renderInvoiceHTML(req.params.id);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="invoice-${req.params.id}.html"`,
    );
    return res.send(html);
  } catch (error) {
    console.error('[Invoice Download]', error.message);
    if (error.message === 'Bill not found') return notFoundResponse(res, error.message);
    return errorResponse(res, error.message);
  }
};

export const getPaymentReceipt = async (req, res) => {
  try {
    const receipt = await invoiceService.getInvoiceReceipt(req.params.paymentId);
    return successResponse(res, receipt, 'Payment receipt fetched successfully');
  } catch (error) {
    return handleInvoiceError(res, error);
  }
};

export default {
  getInvoiceJSON,
  getInvoiceByInvoiceNumberJSON,
  getInvoiceHTML,
  downloadInvoiceHTML,
  getPaymentReceipt,
};