import { ENV } from './env.js';

const KHALTI_BASE_URLS = {
  production: 'https://khalti.com/api/v2',
  test: 'https://dev.khalti.com/api/v2',
  sandbox: 'https://dev.khalti.com/api/v2',
};

const KHALTI_ENV = (ENV.KHALTI_ENVIRONMENT || ENV.KHALTI_ENV || 'test').toLowerCase();

export const KHALTI_CONFIG = {
  ENVIRONMENT: KHALTI_ENV,
  IS_PRODUCTION: KHALTI_ENV === 'production',
  BASE_URL: KHALTI_BASE_URLS[KHALTI_ENV] || KHALTI_BASE_URLS.test,
  SECRET_KEY: ENV.KHALTI_SECRET_KEY || ENV.KHALTI_API_KEY || '',
  REQUEST_TIMEOUT: ENV.KHALTI_REQUEST_TIMEOUT || 15000,
  MAX_RETRIES: ENV.KHALTI_MAX_RETRIES || 3,
  RETRY_DELAY_MS: ENV.KHALTI_RETRY_DELAY_MS || 1000,
  AMOUNT_MULTIPLIER: 100,
  SUPPORTED_PAYMENT_METHODS: [
    'Khalti',
    'EBanking',
    'MobileBanking',
    'ConnectIPS',
    'SCT',
  ],
};

const KHALTI_API_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

const getHeaders = (includeAuth = true) => {
  const headers = { ...KHALTI_API_HEADERS };
  if (includeAuth && KHALTI_CONFIG.SECRET_KEY) {
    headers.Authorization = `Key ${KHALTI_CONFIG.SECRET_KEY}`;
  }
  return headers;
};

class KhaltiError extends Error {
  constructor(message, code, detail = null, statusCode = null) {
    super(message);
    this.name = 'KhaltiError';
    this.code = code;
    this.detail = detail;
    this.statusCode = statusCode;
    this.isKhaltiError = true;
  }
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithRetry = async (url, options, retries = KHALTI_CONFIG.MAX_RETRIES) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), KHALTI_CONFIG.REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type') || '';
    let data;
    try {
      data = contentType.includes('application/json') ? await response.json() : await response.text();
    } catch (parseError) {
      data = null;
    }

    if (response.ok) {
      return { success: true, data, response, statusCode: response.status };
    }

    const errorMessage =
      (typeof data === 'object' && (data.error_message || data.detail || data.message)) ||
      `Khalti API request failed with status ${response.status}`;

    const errorDetail = typeof data === 'object' ? data : { raw: data };

    if (
      response.status === 429 ||
      response.status >= 500 ||
      (response.status >= 400 && retries > 0 && response.status !== 401 && response.status !== 403)
    ) {
      throw new KhaltiError(
        errorMessage,
        `HTTP_${response.status}`,
        errorDetail,
        response.status
      );
    }

    return {
      success: false,
      error: new KhaltiError(
        errorMessage,
        `HTTP_${response.status}`,
        errorDetail,
        response.status
      ),
      data,
      statusCode: response.status,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new KhaltiError(
        'Khalti API request timed out',
        'TIMEOUT',
        { timeoutMs: KHALTI_CONFIG.REQUEST_TIMEOUT }
      );
    }

    if (error instanceof KhaltiError) {
      if (retries > 0) {
        const attempt = KHALTI_CONFIG.MAX_RETRIES - retries + 1;
        const backoff = KHALTI_CONFIG.RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        console.warn(
          `[Khalti] Retrying (${attempt}/${KHALTI_CONFIG.MAX_RETRIES}) after ${backoff}ms for ${url}: ${error.message}`
        );
        await delay(backoff);
        return fetchWithRetry(url, options, retries - 1);
      }
      throw error;
    }

    if (retries > 0) {
      const attempt = KHALTI_CONFIG.MAX_RETRIES - retries + 1;
      const backoff = KHALTI_CONFIG.RETRY_DELAY_MS * Math.pow(2, attempt - 1);
      console.warn(
        `[Khalti] Network error, retrying (${attempt}/${KHALTI_CONFIG.MAX_RETRIES}) after ${backoff}ms: ${error.message}`
      );
      await delay(backoff);
      return fetchWithRetry(url, options, retries - 1);
    }

    throw new KhaltiError(
      'Failed to connect to Khalti API',
      'NETWORK_ERROR',
      { originalError: error.message }
    );
  }
};

const validateSecretKey = () => {
  if (!KHALTI_CONFIG.SECRET_KEY) {
    throw new KhaltiError(
      'Khalti secret key is not configured. Set KHALTI_SECRET_KEY in environment variables.',
      'MISSING_SECRET_KEY'
    );
  }
  if (!KHALTI_CONFIG.SECRET_KEY.startsWith('test_secret_') && !KHALTI_CONFIG.SECRET_KEY.startsWith('live_secret_')) {
    console.warn(
      '[Khalti] ⚠️  Secret key does not match expected format (test_secret_/live_secret_). Double-check your credentials.'
    );
  }
};

export const initiateKhaltiPayment = async (paymentData) => {
  validateSecretKey();

  const {
    amount,
    purchase_order_id,
    purchase_order_name,
    return_url,
    website_url,
    customer_info,
    product_details,
    merchant_username,
    amount_breakdown,
  } = paymentData;

  if (!amount || amount <= 0) {
    throw new KhaltiError('Amount must be a positive number', 'INVALID_AMOUNT');
  }
  if (!purchase_order_id || !String(purchase_order_id).trim()) {
    throw new KhaltiError('purchase_order_id is required', 'MISSING_PURCHASE_ORDER_ID');
  }
  if (!purchase_order_name || !String(purchase_order_name).trim()) {
    throw new KhaltiError('purchase_order_name is required', 'MISSING_PURCHASE_ORDER_NAME');
  }
  if (!return_url || !String(return_url).trim()) {
    throw new KhaltiError('return_url is required for payment redirect', 'MISSING_RETURN_URL');
  }

  const amountInPaisa = Math.round(Number(amount) * KHALTI_CONFIG.AMOUNT_MULTIPLIER);

  const breakdown =
    amount_breakdown && Array.isArray(amount_breakdown) && amount_breakdown.length > 0
      ? amount_breakdown
      : [
          {
            label: purchase_order_name,
            amount: amountInPaisa,
          },
        ];

  const payload = {
    return_url: String(return_url),
    website_url: website_url || ENV.FRONTEND_URL || return_url,
    amount: amountInPaisa,
    purchase_order_id: String(purchase_order_id),
    purchase_order_name: String(purchase_order_name),
    amount_breakdown: breakdown,
  };

  if (customer_info) {
    payload.customer_info = {
      name: customer_info.name ? String(customer_info.name) : undefined,
      email: customer_info.email ? String(customer_info.email) : undefined,
      phone: customer_info.phone ? String(customer_info.phone) : undefined,
    };
    Object.keys(payload.customer_info).forEach(
      (key) => payload.customer_info[key] === undefined && delete payload.customer_info[key]
    );
    if (Object.keys(payload.customer_info).length === 0) delete payload.customer_info;
  }

  if (product_details && Array.isArray(product_details) && product_details.length > 0) {
    payload.product_details = product_details;
  }

  if (merchant_username) {
    payload.merchant_username = String(merchant_username);
  }

  console.log(
    `[Khalti] Initiating payment | order=${purchase_order_id} | amount=Rs.${amount} (${amountInPaisa} paisa) | env=${KHALTI_CONFIG.ENVIRONMENT}`
  );

  const result = await fetchWithRetry(`${KHALTI_CONFIG.BASE_URL}/epayment/initiate/`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(payload),
  });

  if (!result.success) {
    throw result.error;
  }

  return {
    success: true,
    pidx: result.data.pidx,
    payment_url: result.data.payment_url,
    expires_at: result.data.expires_at,
    expires_in_seconds: result.data.expires_in,
    raw: result.data,
  };
};

export const verifyKhaltiPayment = async (pidx) => {
  validateSecretKey();

  if (!pidx || !String(pidx).trim()) {
    throw new KhaltiError('pidx (payment index) is required for verification', 'MISSING_PIDX');
  }

  const trimmedPidx = String(pidx).trim();

  console.log(`[Khalti] Verifying payment | pidx=${trimmedPidx} | env=${KHALTI_CONFIG.ENVIRONMENT}`);

  const result = await fetchWithRetry(`${KHALTI_CONFIG.BASE_URL}/epayment/lookup/`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ pidx: trimmedPidx }),
  });

  if (!result.success) {
    throw result.error;
  }

  const data = result.data;
  const amountInRupees = data.total_amount
    ? Number(data.total_amount) / KHALTI_CONFIG.AMOUNT_MULTIPLIER
    : null;
  const feeInRupees = data.fee
    ? Number(data.fee) / KHALTI_CONFIG.AMOUNT_MULTIPLIER
    : null;

  const response = {
    success: true,
    pidx: data.pidx,
    transaction_id: data.transaction_id || data.txn_id || null,
    status: data.status,
    amount: amountInRupees,
    total_amount: amountInRupees,
    fee: feeInRupees,
    purchase_order_id: data.purchase_order_id,
    purchase_order_name: data.purchase_order_name,
    refunded: data.refunded || false,
    customer_name: data.customer_name || data.customer_info?.name || null,
    customer_email: data.customer_email || data.customer_info?.email || null,
    customer_phone: data.customer_mobile || data.customer_info?.phone || null,
    verified_at: new Date().toISOString(),
    raw: data,
  };

  if (data.status === 'Completed') {
    response.payment_completed = true;
    response.paid_at = data.paid_on || data.created_on || null;
    console.log(
      `[Khalti] ✅ Payment verified | pidx=${trimmedPidx} | amount=Rs.${amountInRupees} | txn=${response.transaction_id}`
    );
  } else {
    response.payment_completed = false;
    console.log(
      `[Khalti] ⚠️  Payment status="${data.status}" | pidx=${trimmedPidx} | amount=Rs.${amountInRupees}`
    );
  }

  return response;
};

export const getKhaltiTransactionStatus = async (pidx) => {
  try {
    return await verifyKhaltiPayment(pidx);
  } catch (err) {
    return {
      success: false,
      status: 'UNKNOWN',
      error: err.message,
      error_code: err.code || 'VERIFICATION_ERROR',
      pidx,
    };
  }
};

export const buildKhaltiCallbackData = (queryParams, bodyParams) => {
  const params = { ...(queryParams || {}), ...(bodyParams || {}) };
  return {
    pidx: params.pidx,
    txnId: params.txnId,
    amount: params.amount,
    total_amount: params.total_amount,
    mobile: params.mobile,
    status: params.status,
    purchase_order_id: params.purchase_order_id,
    purchase_order_name: params.purchase_order_name,
    transaction_id: params.transaction_id || params.txn_id,
  };
};

export const validateKhaltiCallback = async (callbackData, expected = {}) => {
  const { pidx, purchase_order_id, amount } = callbackData;

  if (!pidx) {
    throw new KhaltiError('Missing pidx in callback data', 'CALLBACK_MISSING_PIDX');
  }

  const verification = await verifyKhaltiPayment(pidx);

  if (!verification.payment_completed) {
    throw new KhaltiError(
      `Payment not completed. Current status: ${verification.status}`,
      `PAYMENT_${verification.status?.toUpperCase() || 'INCOMPLETE'}`,
      verification.raw
    );
  }

  if (expected.purchase_order_id && verification.purchase_order_id !== expected.purchase_order_id) {
    throw new KhaltiError(
      'Purchase order ID mismatch between callback and verification',
      'PURCHASE_ORDER_MISMATCH',
      {
        callback: expected.purchase_order_id,
        verified: verification.purchase_order_id,
      }
    );
  }

  if (expected.amount !== undefined) {
    const diff = Math.abs(Number(verification.amount) - Number(expected.amount));
    if (diff > 0.01) {
      throw new KhaltiError(
        'Amount mismatch between expected and verified',
        'AMOUNT_MISMATCH',
        {
          expected: Number(expected.amount),
          verified: Number(verification.amount),
          difference: diff,
        }
      );
    }
  }

  return verification;
};

export const formatKhaltiErrorForUser = (error) => {
  if (!error) return 'An unexpected error occurred with Khalti payment.';
  if (error.isKhaltiError) {
    switch (error.code) {
      case 'MISSING_SECRET_KEY':
        return 'Payment service is misconfigured. Please contact support.';
      case 'TIMEOUT':
      case 'NETWORK_ERROR':
        return 'We could not connect to Khalti. Please try again in a moment.';
      case 'INVALID_AMOUNT':
        return 'Payment amount is invalid.';
      case 'HTTP_401':
      case 'HTTP_403':
        return 'Payment service authentication failed. Please contact support.';
      case 'HTTP_400':
        return error.detail?.detail || 'Payment request was invalid. Please review your details.';
      case 'HTTP_429':
        return 'Too many payment attempts. Please wait a moment and try again.';
      case 'HTTP_500':
      case 'HTTP_502':
      case 'HTTP_503':
      case 'HTTP_504':
        return 'Khalti service is currently unavailable. Please try again shortly.';
      case 'PAYMENT_INCOMPLETE':
      case 'PAYMENT_PENDING':
      case 'PAYMENT_USER_CANCELLED':
        return 'Payment was not completed. You can try again or choose another payment method.';
      case 'AMOUNT_MISMATCH':
        return 'Payment amount does not match the expected amount. Please contact support.';
      case 'PURCHASE_ORDER_MISMATCH':
        return 'Payment verification failed for your order. Please contact support.';
      default:
        return error.message || 'Khalti payment failed. Please try again.';
    }
  }
  return error.message || 'Payment failed. Please try again.';
};

export const isKhaltiConfigured = () => {
  return !!KHALTI_CONFIG.SECRET_KEY;
};

export default {
  KHALTI_CONFIG,
  initiateKhaltiPayment,
  verifyKhaltiPayment,
  getKhaltiTransactionStatus,
  buildKhaltiCallbackData,
  validateKhaltiCallback,
  formatKhaltiErrorForUser,
  isKhaltiConfigured,
  KhaltiError,
};