// Database tables
export const TABLES = {
    USERS: "users",
    COMPANIES: "companies",
    MEMBERSHIPS: "memberships",
  };
  
  // User roles
  export const ROLES = {
    SUPER_ADMIN: "SUPER_ADMIN",
    USER: "USER",
  };
  
  // Company roles
  export const COMPANY_ROLES = {
    ADMIN: "ADMIN",
    DEVELOPER: "DEVELOPER",
    QA: "QA",
    OTHERS: "OTHERS",
  };
  
  // Membership status
  export const STATUS = {
    ACTIVE: "active",
    INACTIVE: "inactive",
    PENDING: "pending",
    SUSPENDED: "suspended",
  };
  
  // Company sizes
  export const COMPANY_SIZES = {
    STARTUP: "startup",
    SMALL: "small",
    MEDIUM: "medium",
    LARGE: "large",
    ENTERPRISE: "enterprise",
  };

  // API configuration
  export const API = {
    VERSION: "/api/v1",
    PREFIX: "/api",
  };