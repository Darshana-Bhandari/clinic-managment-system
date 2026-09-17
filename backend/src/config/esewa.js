import { EsewaClient } from "esewa-pay";
import { ENV } from "./env.js";

// Initialize the eSewa client
export const esewa = new EsewaClient({
  secretKey: ENV.ESEWA_SECRET_KEY,
  productCode: ENV.ESEWA_PRODUCT_CODE,
  successUrl: ENV.ESEWA_SUCCESS_URL,
  failureUrl: ENV.ESEWA_FAILURE_URL,
  env: ENV.ESEWA_ENVIRONMENT,
});
