import khaltiService from './khalti.service.js';
import {
  successResponse,
  createdResponse,
  errorResponse,
  notFoundResponse,
  conflictResponse,
  badRequestResponse,
  unauthorizedResponse,
} from '../../utils/response.js';
import { formatKhaltiErrorForUser, KhaltiError, isKhaltiConfigured } from '../../config/khalti.js';
import { ENV } from '../../config/env.js';

const handleKhaltiError = (res, error) => {
  console.error('[Khalti Controller] Error:', {
    message: error.message,
    code: error.code,
    stack: error.stack?.split('\n').slice(0, 3),
  });

  if (error instanceof KhaltiError) {
    switch (error.code) {
      case 'INVALID_PAYLOAD':
      case 'MISSING_PIDX':
      case 'INVALID_AMOUNT':
      case 'INVALID_PAYMENT_TYPE':
        return badRequestResponse(res, error.message, { code: error.code, detail: error.detail });

      case 'REF_NOT_FOUND':
      case 'PAYMENT_NOT_FOUND':
      case 'PATIENT_NOT_FOUND':
        return notFoundResponse(res, error.message, { code: error.code, detail: error.detail });

      case 'BILL_ALREADY_PAID':
      case 'BILL_CANCELLED':
        return conflictResponse(res, error.message, { code: error.code, detail: error.detail });

      case 'UNAUTHORIZED':
        return unauthorizedResponse(res, error.message, { code: error.code });

      case 'MISSING_SECRET_KEY':
        return errorResponse(res, 'Khalti is not configured on this server. Please contact admin.', 500, {
          code: error.code,
        });

      case 'TIMEOUT':
      case 'NETWORK_ERROR':
        return errorResponse(res, formatKhaltiErrorForUser(error), 503, {
          code: error.code,
          user_message: formatKhaltiErrorForUser(error),
        });

      case 'HTTP_400':
        return badRequestResponse(
          res,
          error.detail?.detail || error.detail?.error_message || error.message,
          { code: error.code, detail: error.detail }
        );

      case 'HTTP_401':
      case 'HTTP_403':
        return errorResponse(
          res,
          'Khalti authentication failed. Please check merchant credentials with admin.',
          500,
          { code: error.code }
        );

      case 'HTTP_429':
        return errorResponse(
          res,
          'Too many payment requests. Please wait a moment and try again.',
          429,
          { code: error.code }
        );

      case 'HTTP_500':
      case 'HTTP_502':
      case 'HTTP_503':
      case 'HTTP_504':
        return errorResponse(res, 'Khalti service is unavailable right now. Please try again later.', 503, {
          code: error.code,
        });

      default:
        return errorResponse(res, formatKhaltiErrorForUser(error), 500, {
          code: error.code || 'KHALTI_ERROR',
          detail: error.detail,
        });
    }
  }

  if (error.message?.includes('not found')) {
    return notFoundResponse(res, error.message);
  }
  if (error.message?.toLowerCase().includes('already') || error.message?.includes('paid')) {
    return conflictResponse(res, error.message);
  }
  if (error.message?.includes('authorized') || error.message?.includes('permission')) {
    return unauthorizedResponse(res, error.message);
  }

  return errorResponse(res, error.message || 'Something went wrong with Khalti payment.');
};

export const initiatePayment = async (req, res) => {
  try {
    if (!isKhaltiConfigured()) {
      return errorResponse(res, 'Khalti payment is not available at this time.', 503, {
        code: 'KHALTI_NOT_CONFIGURED',
      });
    }

    const result = await khaltiService.initiateKhalti(req.body, req.user);
    return createdResponse(res, result, 'Khalti payment initiated successfully. Please complete the payment using the returned payment_url.');
  } catch (error) {
    return handleKhaltiError(res, error);
  }
};

export const verifyPayment = async (req, res) => {
  try {
    if (!isKhaltiConfigured()) {
      return errorResponse(res, 'Khalti payment is not available at this time.', 503, {
        code: 'KHALTI_NOT_CONFIGURED',
      });
    }

    const payload = {
      pidx: req.body.pidx || req.params.pidx || req.query.pidx,
    };

    const result = await khaltiService.verifyKhalti(payload);

    if (result.success) {
      return successResponse(res, result, result.message || 'Payment verified successfully.');
    }

    if (result.paymentStatus === 'PENDING') {
      return successResponse(res, result, 'Payment is still pending. Please check again later.');
    }

    return errorResponse(res, result.message || 'Payment verification failed.', 402, {
      code: 'PAYMENT_FAILED',
      ...result,
    });
  } catch (error) {
    return handleKhaltiError(res, error);
  }
};

export const callbackHandler = async (req, res) => {
  try {
    if (!isKhaltiConfigured()) {
      console.error('[Khalti Callback] Khalti is not configured but callback was hit.');
      const fallback = ENV.FRONTEND_URL || '/';
      return res.redirect(`${fallback}/payment/failed?reason=${encodeURIComponent('Payment service not configured')}`);
    }

    const result = await khaltiService.handleKhaltiCallback(req.query, req.body);

    if (result.success) {
      console.log(
        `[Khalti Callback] ✅ Success | paymentId=${result.paymentId} | amount=${result.amount} | txn=${result.transaction_id}`
      );
    } else {
      console.warn(
        `[Khalti Callback] ❌ Failed | code=${result.error_code} | error=${result.error} | message=${result.user_message}`
      );
    }

    const redirectUrl = result.redirect_url || ENV.FRONTEND_URL || '/';

    const acceptHeader = req.headers.accept || '';
    const isJsonRequest =
      acceptHeader.includes('application/json') ||
      (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) ||
      req.query.format === 'json';

    if (isJsonRequest || req.method === 'POST') {
      return successResponse(res, result, result.success ? 'Payment callback processed' : 'Payment callback processed with failure');
    }

    return res.redirect(redirectUrl);
  } catch (error) {
    console.error('[Khalti Callback] Unhandled error:', error);
    const fallback = `${ENV.FRONTEND_URL || ''}/payment/failed?reason=${encodeURIComponent('Unexpected error during payment processing')}`;
    return res.redirect(fallback);
  }
};

export const getPaymentStatus = async (req, res) => {
  try {
    const { pidx } = req.params;
    if (!pidx) return badRequestResponse(res, 'pidx is required');

    const result = await khaltiService.getKhaltiPaymentStatus(pidx);
    if (!result.success && result.error) {
      return notFoundResponse(res, result.error, { pidx });
    }
    return successResponse(res, result, 'Payment status fetched successfully');
  } catch (error) {
    return handleKhaltiError(res, error);
  }
};

export const getKhaltiConfig = (_req, res) => {
  return successResponse(res, {
    enabled: isKhaltiConfigured(),
    environment: ENV.KHALTI_ENVIRONMENT || ENV.NODE_ENV,
    supported: true,
    docs: 'https://docs.khalti.com/',
  }, 'Khalti configuration status');
};

export default {
  initiatePayment,
  verifyPayment,
  callbackHandler,
  getPaymentStatus,
  getKhaltiConfig,
};