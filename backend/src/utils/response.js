import { ZodError } from 'zod';
import { STATUS_CODES } from '../constants/statusCodes.js';

export const successResponse = (res, data, message = 'Success', statusCode = STATUS_CODES.OK) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (res, message = 'Error', statusCode = STATUS_CODES.BAD_REQUEST, errors = null) => {
  const response = { success: false, message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

export const createdResponse = (res, data, message = 'Created successfully') => {
  return successResponse(res, data, message, STATUS_CODES.CREATED);
};