// API Constants - Match backend routes exactly
export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    REGISTER: '/api/v1/auth/register',
    LOGOUT: '/api/v1/auth/logout',
    GOOGLE_LOGIN: '/api/v1/auth/google-login',
    VERIFY_EMAIL: '/api/v1/auth/verify-email',
    RESEND_VERIFICATION: '/api/v1/auth/resend-verification',
    FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
    RESET_PASSWORD: '/api/v1/auth/reset-password',
  },
  
  // User endpoints
  USERS: {
    LIST: '/api/v1/users',
    SEARCH: '/api/v1/users/search',
    GET_BY_ID: (userId) => `/api/v1/users/${userId}`,
    UPDATE: (userId) => `/api/v1/users/${userId}`,
    DELETE: (userId) => `/api/v1/users/${userId}`,
    GET_BY_EMAIL: (email) => `/api/v1/users/email/${email}`,
    UPDATE_ROLE: (userId) => `/api/v1/users/${userId}/role`,
    GET_COMPANIES: (userId) => `/api/v1/users/${userId}/companies`,
    GET_STATS: (userId) => `/api/v1/users/${userId}/stats`,
    // Current user endpoints
    ME: '/api/v1/users/me',
    ME_UPDATE: '/api/v1/users/me',
    ME_COMPANIES: '/api/v1/users/me/companies',
    ME_STATS: '/api/v1/users/me/stats',
  },
  
  // Company endpoints
  COMPANIES: {
    LIST: '/api/v1/companies',
    CREATE: '/api/v1/companies',
    SEARCH: '/api/v1/companies/search',
    GET_BY_ID: (companyId) => `/api/v1/companies/${companyId}`,
    UPDATE: (companyId) => `/api/v1/companies/${companyId}`,
    DELETE: (companyId) => `/api/v1/companies/${companyId}`,
    GET_MEMBERS: (companyId) => `/api/v1/companies/${companyId}/members`,
    ADD_MEMBER: (companyId) => `/api/v1/companies/${companyId}/members`,
    REMOVE_MEMBER: (companyId, userId) => `/api/v1/companies/${companyId}/members/${userId}`,
    UPDATE_MEMBER_ROLE: (companyId, userId) => `/api/v1/companies/${companyId}/members/${userId}/role`,
    GET_STATS: (companyId) => `/api/v1/companies/${companyId}/stats`,
    UPLOAD_LOGO: (companyId) => `/api/v1/companies/${companyId}/upload-logo`,
    GET_SETTINGS: (companyId) => `/api/v1/companies/${companyId}/settings`,
    UPDATE_SETTINGS: (companyId) => `/api/v1/companies/${companyId}/settings`,
  },
  
  // Project endpoints
  PROJECTS: {
    CREATE: (companyId) => `/api/v1/companies/${companyId}/projects`,
    LIST_BY_COMPANY: (companyId) => `/api/v1/companies/${companyId}/projects`,
    SEARCH_BY_COMPANY: (companyId) => `/api/v1/companies/${companyId}/projects/search`,
    GET_BY_ID: (projectId) => `/api/v1/projects/${projectId}`,
    UPDATE: (projectId) => `/api/v1/projects/${projectId}`,
    DELETE: (projectId) => `/api/v1/projects/${projectId}`,
  },
  
  // Bug endpoints
  BUGS: {
    CREATE: '/api/v1/bugs', // Public endpoint for widget
    GET_BY_ID: (bugId) => `/api/v1/bugs/${bugId}`,
    UPDATE: (bugId) => `/api/v1/bugs/${bugId}`,
    DELETE: (bugId) => `/api/v1/bugs/${bugId}`,
    ASSIGN: (bugId) => `/api/v1/bugs/${bugId}/assign`,
    UNASSIGN: (bugId) => `/api/v1/bugs/${bugId}/unassign`,
    LIST_BY_PROJECT: (projectId) => `/api/v1/projects/${projectId}/bugs`,
    SEARCH_BY_PROJECT: (projectId) => `/api/v1/projects/${projectId}/bugs/search`,
    LIST_BY_COMPANY: (companyId) => `/api/v1/companies/${companyId}/bugs`,
    USER_ASSIGNED: '/api/v1/users/me/bugs',
  },
  
  // Admin endpoints
  ADMIN: {
    ADD_USER_TO_COMPANY: (companyId) => `/api/v1/admin/companies/${companyId}/users`,
  },
};

// Global User Roles (match backend exactly)
export const GLOBAL_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  USER: 'USER',
};

// Company Roles (match backend exactly)
export const COMPANY_ROLES = {
  ADMIN: 'ADMIN',
  DEVELOPER: 'DEVELOPER',
  QA: 'QA',
  OTHERS: 'OTHERS',
};

// Legacy alias for backwards compatibility
export const USER_ROLES = {
  ...GLOBAL_ROLES,
  ...COMPANY_ROLES,
};

// Bug Priorities
export const BUG_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

// Bug Status
export const BUG_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

// Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters long',
  PASSWORD_COMPLEXITY: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
}; 