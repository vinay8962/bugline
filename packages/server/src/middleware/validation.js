import { body, param, query, validationResult } from 'express-validator';

// Validation error handler
export const handleValidationErrors = (req, res, next) => {
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

// User validation rules
export const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('full_name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  handleValidationErrors
];

export const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

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

// Company validation rules
export const validateCompanyCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('slug')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
  handleValidationErrors
];

export const validateCompanyUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('slug')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
  handleValidationErrors
];

// Project validation rules
export const validateProjectCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Project name must be between 2 and 100 characters'),
  body('slug')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
  handleValidationErrors
];

export const validateProjectUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Project name must be between 2 and 100 characters'),
  body('slug')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
  handleValidationErrors
];

// Bug validation rules
export const validateBugCreation = [
  body('project_id')
    .isUUID()
    .withMessage('Valid project ID is required'),
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Bug title must be between 5 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Bug description must be between 10 and 2000 characters'),
  body('status')
    .optional()
    .isIn(['open', 'in_progress', 'resolved', 'closed'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid priority'),
  body('reporter_email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid reporter email is required'),
  body('assigned_to')
    .optional()
    .isUUID()
    .withMessage('Valid user ID is required for assignment'),
  handleValidationErrors
];

export const validateBugUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Bug title must be between 5 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Bug description must be between 10 and 2000 characters'),
  body('status')
    .optional()
    .isIn(['open', 'in_progress', 'resolved', 'closed'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid priority'),
  body('assigned_to')
    .optional()
    .isUUID()
    .withMessage('Valid user ID is required for assignment'),
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

// Parameter validation
export const validateUUIDParam = (paramName) => [
  param(paramName)
    .isUUID()
    .withMessage(`Valid ${paramName} is required`),
  handleValidationErrors
];

// Query validation
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

// Auth validation schemas
export const authSchemas = {
  register: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('First name must be between 1 and 50 characters'),
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Last name must be between 1 and 50 characters'),
    body('full_name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be between 2 and 100 characters'),
    handleValidationErrors
  ],
  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    handleValidationErrors
  ],
  verifyEmail: [
    body('token')
      .notEmpty()
      .withMessage('Verification token is required'),
    handleValidationErrors
  ],
  resendVerification: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    handleValidationErrors
  ],
  forgotPassword: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    handleValidationErrors
  ],
  resetPassword: [
    body('token')
      .notEmpty()
      .withMessage('Reset token is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    handleValidationErrors
  ]
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

// Company validation schemas
export const companySchemas = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Company name must be between 2 and 100 characters'),
    body('slug')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .matches(/^[a-z0-9-]+$/)
      .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
    handleValidationErrors
  ],
  update: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Company name must be between 2 and 100 characters'),
    body('slug')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .matches(/^[a-z0-9-]+$/)
      .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
    handleValidationErrors
  ]
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

// Validation helper function
export const validate = (schema) => {
  return schema;
};

// Combined validation helpers
export const validateUserParams = validateUUIDParam('userId');
export const validateCompanyParams = validateUUIDParam('companyId');
export const validateProjectParams = validateUUIDParam('projectId');
export const validateBugParams = validateUUIDParam('bugId');