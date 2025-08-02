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
  ],
  googleLogin: [
    body('idToken')
      .notEmpty()
      .withMessage('Google ID token is required'),
    handleValidationErrors
  ]
};

// Individual auth validation exports
export const validateUserRegistration = authSchemas.register;
export const validateUserLogin = authSchemas.login;
export const validateVerifyEmail = authSchemas.verifyEmail;
export const validateResendVerification = authSchemas.resendVerification;
export const validateForgotPassword = authSchemas.forgotPassword;
export const validateResetPassword = authSchemas.resetPassword;
export const validateGoogleLogin = authSchemas.googleLogin; 