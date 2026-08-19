import { ZodError } from "zod";
import { STATUS_CODES } from "../constants/statusCodes.js";

export const successResponse = (
  res,
  data,
  message = "Success",
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
  message = "Error",
  statusCode = STATUS_CODES.BAD_REQUEST,
  errors = null
) => {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

export const createdResponse = (
  res,
  data,
  message = "Created successfully"
) => {
  return successResponse(
    res,
    data,
    message,
    STATUS_CODES.CREATED
  );
};

export const unauthorizedResponse = (
  res,
  message = "Unauthorized"
) => {
  return errorResponse(
    res,
    message,
    STATUS_CODES.UNAUTHORIZED
  );
};

export const forbiddenResponse = (
  res,
  message = "Forbidden"
) => {
  return errorResponse(
    res,
    message,
    STATUS_CODES.FORBIDDEN
  );
};

export const notFoundResponse = (
  res,
  message = "Resource not found"
) => {
  return errorResponse(
    res,
    message,
    STATUS_CODES.NOT_FOUND
  );
};

export const conflictResponse = (
  res,
  message = "Conflict"
) => {
  return errorResponse(
    res,
    message,
    STATUS_CODES.CONFLICT
  );
};

export const serverErrorResponse = (
  res,
  message = "Internal server error",
  errors = null
) => {
  return errorResponse(
    res,
    message,
    STATUS_CODES.INTERNAL_SERVER_ERROR,
    errors
  );
};

export const handleZodError = (res, error) => {
  if (error instanceof ZodError) {
    return errorResponse(
      res,
      "Validation failed",
      STATUS_CODES.BAD_REQUEST,
      error.flatten()
    );
  }

  return null;
};