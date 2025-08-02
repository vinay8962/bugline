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

// Custom error classes
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation error") {
    super(message, 400);
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict") {
    super(message, 409);
    this.name = "ConflictError";
  }
}

// Async error wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
