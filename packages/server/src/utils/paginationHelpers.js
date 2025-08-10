// Pagination utility functions for performance optimization

// Maximum allowed page size to prevent large data transfers
export const MAX_PAGE_SIZE = 50;
export const DEFAULT_PAGE_SIZE = 10;

/**
 * Sanitize pagination parameters to prevent performance issues
 * @param {number} page - Page number from request
 * @param {number} limit - Page size from request  
 * @returns {Object} Sanitized pagination parameters
 */
export const sanitizePagination = (page = 1, limit = DEFAULT_PAGE_SIZE) => {
  const sanitizedPage = Math.max(1, parseInt(page) || 1);
  const sanitizedLimit = Math.min(
    Math.max(1, parseInt(limit) || DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE
  );
  
  const skip = (sanitizedPage - 1) * sanitizedLimit;
  
  return {
    page: sanitizedPage,
    limit: sanitizedLimit,
    skip,
    take: sanitizedLimit
  };
};

/**
 * Create pagination response object
 * @param {number} page - Current page
 * @param {number} limit - Page size
 * @param {number} total - Total record count
 * @returns {Object} Pagination metadata
 */
export const createPaginationResponse = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrevious: page > 1
  };
};

/**
 * Validate search term length to prevent expensive queries
 * @param {string} searchTerm - Search term from request
 * @param {number} minLength - Minimum search term length (default: 2)
 * @returns {string|null} Validated search term or null if invalid
 */
export const validateSearchTerm = (searchTerm, minLength = 2) => {
  if (!searchTerm || typeof searchTerm !== 'string') {
    return null;
  }
  
  const trimmed = searchTerm.trim();
  return trimmed.length >= minLength ? trimmed : null;
};