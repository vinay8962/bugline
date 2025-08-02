import { body, validationResult } from 'express-validator';

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// Admin validation schemas
export const adminSchemas = {
  createUser: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('full_name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be between 2 and 100 characters'),
    body('role')
      .optional()
      .isIn(['ADMIN', 'DEVELOPER', 'QA', 'OTHERS'])
      .withMessage('Invalid company role'),
    handleValidationErrors
  ],
  bulkCreateUsers: [
    body('users')
      .isArray({ min: 1 })
      .withMessage('Users array is required and cannot be empty'),
    body('users.*.email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required for all users'),
    body('users.*.full_name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be between 2 and 100 characters for all users'),
    body('users.*.role')
      .optional()
      .isIn(['ADMIN', 'DEVELOPER', 'QA', 'OTHERS'])
      .withMessage('Invalid company role'),
    handleValidationErrors
  ],
  updateUserRole: [
    body('role')
      .isIn(['ADMIN', 'DEVELOPER', 'QA', 'OTHERS'])
      .withMessage('Invalid company role'),
    handleValidationErrors
  ],
  suspendUser: [
    body('reason')
      .optional()
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage('Suspension reason must be between 1 and 500 characters'),
    handleValidationErrors
  ],
  resendVerification: [
    body('companyId')
      .optional()
      .isUUID()
      .withMessage('Valid company ID is required'),
    handleValidationErrors
  ]
}; 