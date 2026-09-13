import * as esewaService from './esewa.service.js';
import {
  successResponse,
  createdResponse,
  errorResponse,
  notFoundResponse,
  conflictResponse,
  badRequestResponse,
  unauthorizedResponse,
} from '../../utils/response.js';
import { ENV } from '../../config/env.js';

const handleEsewaError = (res, error) => {
  console.error('[eSewa Controller] Error:', {
    message: error.message,
    stack: error.stack?.split('\n').slice(0, 3),
  });

  if (error.message?.includes('not found')) {
    return notFoundResponse(res, error.message);
  }

  if (error.message?.includes('already paid') || error.message?.includes('cancelled') || error.message?.includes('refunded')) {
    return conflictResponse(res, error.message);
  }

  if (error.message?.includes('authorized') || error.message?.includes('permission')) {
    return unauthorizedResponse(res, error.message);
  }

  if (error.message?.includes('required')) {
    return badRequestResponse(res, error.message);
  }

  return errorResponse(res, error.message || 'Something went wrong with eSewa payment.');
};

export const initiatePayment = async (req, res) => {
  try {
    if (!esewaService.isEsewaConfigured()) {
      return errorResponse(res, 'eSewa payment is not available at this time.', 503, {
        code: 'ESEWA_NOT_CONFIGURED',
      });
    }

    const result = await esewaService.initiateEsewaPayment(req.body, req.user);
    return createdResponse(res, result, 'eSewa payment initiated successfully.');
  } catch (error) {
    return handleEsewaError(res, error);
  }
};

export const verifyPayment = async (req, res) => {
  try {
    if (!esewaService.isEsewaConfigured()) {
      return errorResponse(res, 'eSewa payment is not available at this time.', 503, {
        code: 'ESEWA_NOT_CONFIGURED',
      });
    }

    const result = await esewaService.verifyEsewaPayment(req.body || {});

    if (result.success) {
      return successResponse(res, result, result.message || 'Payment verified successfully.');
    }

    return errorResponse(res, result.message || 'Payment verification failed.', 402, {
      code: 'PAYMENT_FAILED',
      ...result,
    });
  } catch (error) {
    return handleEsewaError(res, error);
  }
};

export const handleCallback = async (req, res) => {
  try {
    const payload = {
      data: req.body?.data || req.query?.data,
      transaction_uuid: req.body?.transaction_uuid || req.query?.transaction_uuid,
      amount: req.body?.amount || req.query?.amount,
    };

    const result = await esewaService.verifyEsewaPayment(payload);

    const fallback = ENV.FRONTEND_URL || '/';
    const redirectUrl = result.success
      ? `${fallback}/payment/success?provider=esewa&txn=${encodeURIComponent(result.transaction_uuid || '')}`
      : `${fallback}/payment/failed?provider=esewa&reason=${encodeURIComponent(result.message || 'Payment failed')}`;

    if (req.method === 'POST' || req.headers.accept?.includes('application/json')) {
      return successResponse(res, result, result.success ? 'Payment callback processed' : 'Payment callback processed with failure');
    }

    return res.redirect(redirectUrl);
  } catch (error) {
    console.error('[eSewa Callback] Unhandled error:', error);
    const fallback = `${ENV.FRONTEND_URL || ''}/payment/failed?provider=esewa&reason=${encodeURIComponent('Unexpected error during payment processing')}`;
    return res.redirect(fallback);
  }
};

export const getPaymentStatus = async (req, res) => {
  try {
    const { transaction_uuid } = req.params;

    if (!transaction_uuid) {
      return badRequestResponse(res, 'transaction_uuid is required');
    }

    const result = await esewaService.getEsewaPaymentStatus(transaction_uuid, req.query.total_amount || 0);
    return successResponse(res, result, 'Payment status fetched successfully');
  } catch (error) {
    return handleEsewaError(res, error);
  }
};

export const getEsewaConfig = (_req, res) => {
  return successResponse(
    res,
    {
      enabled: esewaService.isEsewaConfigured(),
      environment: ENV.ESEWA_ENVIRONMENT || ENV.NODE_ENV,
      supported: true,
      docs: 'https://developer.esewa.com.np/pages/Epay#transactionflow',
    },
    'eSewa configuration status'
  );
};