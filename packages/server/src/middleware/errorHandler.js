import { createErrorResponse } from '../utils/responseHelpers.js';

// Error handling middleware
export const errorHandler = (err, req, res, _next) => {
  if (process.env.NODE_ENV === 'development') {
    console.error("Error:", err);
  }

  // Default error
  let statusCode = 500;
  let message = "Internal server error";
  let code = null;

  // Handle different types of errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation error";
    code = "VALIDATION_ERROR";
  } else if (err.name === "UnauthorizedError") {
    statusCode = 401;
    message = "Unauthorized";
    code = "UNAUTHORIZED_ERROR";
  } else if (err.name === "ForbiddenError") {
    statusCode = 403;
    message = "Forbidden";
    code = "FORBIDDEN_ERROR";
  } else if (err.name === "NotFoundError") {
    statusCode = 404;
    message = "Resource not found";
    code = "NOT_FOUND_ERROR";
  } else if (err.name === "ConflictError") {
    statusCode = 409;
    message = "Resource conflict";
    code = "CONFLICT_ERROR";
  } else if (err.code === "23505") {
    // PostgreSQL unique constraint
    statusCode = 409;
    message = "Resource already exists";
    code = "UNIQUE_CONSTRAINT_ERROR";
  } else if (err.code === "23503") {
    // PostgreSQL foreign key constraint
    statusCode = 400;
    message = "Invalid reference";
    code = "FOREIGN_KEY_ERROR";
  }

  // Use statusCode if it's set on the error object
  if (err.statusCode) {
    statusCode = err.statusCode;
  }

  // Use message from error if available
  if (err.message && err.message !== 'undefined') {
    message = err.message;
  }

  // Create standardized error response
  const errorResponse = createErrorResponse(
    message,
    code,
    process.env.NODE_ENV === "development" ? [{ stack: err.stack }] : null,
    req.id // Request ID if available
  );

  res.status(statusCode).json(errorResponse);
};

// Functional error creation helpers
export const createAppError = (message, statusCode = 500, name = 'AppError') => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.name = name;
  Error.captureStackTrace(error, createAppError);
  return error;
};

export const createValidationError = (message = "Validation error") => {
  return createAppError(message, 400, "ValidationError");
};

export const createUnauthorizedError = (message = "Unauthorized") => {
  return createAppError(message, 401, "UnauthorizedError");
};

export const createForbiddenError = (message = "Forbidden") => {
  return createAppError(message, 403, "ForbiddenError");
};

export const createNotFoundError = (message = "Resource not found") => {
  return createAppError(message, 404, "NotFoundError");
};

export const createConflictError = (message = "Resource conflict") => {
  return createAppError(message, 409, "ConflictError");
};

// Async error wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
