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

// User validation schemas
export const userSchemas = {
  updateProfile: [
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('full_name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be between 2 and 100 characters'),
    handleValidationErrors
  ],
  updateGlobalRole: [
    body('global_role')
      .isIn(['USER', 'SUPER_ADMIN'])
      .withMessage('Invalid global role'),
    handleValidationErrors
  ]
};

// User validation rules
export const validateUserUpdate = [
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('full_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('global_role')
    .optional()
    .isIn(['USER', 'SUPER_ADMIN'])
    .withMessage('Invalid global role'),
  handleValidationErrors
];

// Company user management validation
export const validateAddUserToCompany = [
  body('userId')
    .isUUID()
    .withMessage('Valid user ID is required'),
  body('role')
    .optional()
    .isIn(['ADMIN', 'DEVELOPER', 'QA', 'OTHERS'])
    .withMessage('Invalid company role'),
  handleValidationErrors
];

export const validateUpdateCompanyUserRole = [
  body('role')
    .isIn(['ADMIN', 'DEVELOPER', 'QA', 'OTHERS'])
    .withMessage('Invalid company role'),
  handleValidationErrors
];

// Bug assignment validation
export const validateBugAssignment = [
  body('userId')
    .isUUID()
    .withMessage('Valid user ID is required'),
  handleValidationErrors
]; 