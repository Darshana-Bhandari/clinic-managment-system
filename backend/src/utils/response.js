import { STATUS_CODES } from "../constans/statusCodes.js";

export const successResponse = (
  res,
  message,
  data = null,
  statusCode = STATUS_CODES.OK
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (
  res,
  message,
  errors = null,
  statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};