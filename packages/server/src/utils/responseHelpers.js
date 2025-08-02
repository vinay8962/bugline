/**
 * Standardized API response helpers
 * Implements the response format specified in README
 */

/**
 * Create a standardized success response
 * @param {any} data - Response data
 * @param {string} message - Success message
 * @param {object} pagination - Pagination object (optional)
 * @returns {object} Formatted response
 */
export const createSuccessResponse = (data, message = "Operation completed successfully", pagination = null) => {
  const response = {
    success: true,
    data,
    message,
    meta: {
      timestamp: new Date().toISOString(),
      version: "2.2"
    }
  };

  if (pagination) {
    response.pagination = pagination;
  }

  return response;
};

/**
 * Create a standardized error response
 * @param {string} message - Error message
 * @param {number} code - Error code (optional)
 * @param {array} details - Error details array (optional)
 * @param {string} requestId - Request ID for tracking (optional)
 * @returns {object} Formatted error response
 */
export const createErrorResponse = (message, code = null, details = null, requestId = null) => {
  const response = {
    success: false,
    error: {
      message,
      ...(code && { code }),
      ...(details && { details })
    },
    meta: {
      timestamp: new Date().toISOString(),
      ...(requestId && { requestId })
    }
  };

  return response;
};

/**
 * Create pagination object
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @returns {object} Pagination object
 */
export const createPagination = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
};

/**
 * Send success response with standard format
 * @param {object} res - Express response object
 * @param {any} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {object} pagination - Pagination object (optional)
 */
export const sendSuccess = (res, data, message = "Operation completed successfully", statusCode = 200, pagination = null) => {
  res.status(statusCode).json(createSuccessResponse(data, message, pagination));
};

/**
 * Send error response with standard format
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 400)
 * @param {string} code - Error code (optional)
 * @param {array} details - Error details (optional)
 */
export const sendError = (res, message, statusCode = 400, code = null, details = null) => {
  res.status(statusCode).json(createErrorResponse(message, code, details));
};