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