// Main validation file that re-exports all validation functions
// This maintains backward compatibility while using the new organized structure

// Core validation functions
export {
  handleValidationErrors,
  validateUUIDParam,
  validatePagination,
  validateSearch,
  validate,
  validateUserParams,
  validateCompanyParams,
  validateProjectParams,
  validateBugParams
} from './validation/index.js';

// Auth validation
export {
  authSchemas,
  validateUserRegistration,
  validateUserLogin,
  validateVerifyEmail,
  validateResendVerification,
  validateForgotPassword,
  validateResetPassword,
  validateGoogleLogin
} from './validation/auth.js';

// User validation
export {
  userSchemas,
  validateUserUpdate,
  validateAddUserToCompany,
  validateUpdateCompanyUserRole,
  validateBugAssignment
} from './validation/user.js';

// Company validation
export {
  companySchemas,
  validateCompanyCreation,
  validateCompanyUpdate
} from './validation/company.js';

// Project validation
export {
  validateProjectCreation,
  validateProjectUpdate
} from './validation/project.js';

// Bug validation
export {
  validateBugCreation,
  validateBugUpdate
} from './validation/bug.js';

// Admin validation
export {
  adminSchemas
} from './validation/admin.js';