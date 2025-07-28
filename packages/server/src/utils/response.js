// Utility functions for consistent API responses

export const successResponse = (
  res,
  data,
  message = "Success",
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

export const errorResponse = (
  res,
  message = "Error occurred",
  statusCode = 500,
  errors = null
) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

export const paginatedResponse = (
  res,
  data,
  pagination,
  message = "Success"
) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
    timestamp: new Date().toISOString(),
  });
};

export const createdResponse = (
  res,
  data,
  message = "Created successfully"
) => {
  return successResponse(res, data, message, 201);
};

export const noContentResponse = (res, message = "No content") => {
  return res.status(204).json({
    success: true,
    message,
    timestamp: new Date().toISOString(),
  });
};

export const validationErrorResponse = (
  res,
  errors,
  message = "Validation failed"
) => {
  return errorResponse(res, message, 400, errors);
};

export const notFoundResponse = (res, message = "Resource not found") => {
  return errorResponse(res, message, 404);
};

export const unauthorizedResponse = (res, message = "Unauthorized") => {
  return errorResponse(res, message, 401);
};

export const forbiddenResponse = (res, message = "Forbidden") => {
  return errorResponse(res, message, 403);
};

export const conflictResponse = (res, message = "Resource conflict") => {
  return errorResponse(res, message, 409);
};
