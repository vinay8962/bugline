import { body, param, query, validationResult } from 'express-validator';
import { sendError } from '../../utils/responseHelpers.js';

// Validation error handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    return sendError(
      res, 
      'Validation failed', 
      400, 
      'VALIDATION_ERROR', 
      formattedErrors
    );
  }
  
  next();
};

// Parameter validation helper
export const validateUUIDParam = (paramName) => [
  param(paramName)
    .isUUID()
    .withMessage(`Valid ${paramName} is required`),
  handleValidationErrors
];

// Query validation helpers
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

export const validateSearch = [
  query('q')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  handleValidationErrors
];

// Validation helper function
export const validate = (schema) => {
  return schema;
};

// Combined validation helpers
export const validateUserParams = validateUUIDParam('userId');
export const validateCompanyParams = validateUUIDParam('companyId');
export const validateProjectParams = validateUUIDParam('projectId');
export const validateBugParams = validateUUIDParam('bugId'); 