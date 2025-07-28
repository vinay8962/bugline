import Joi from "joi";

// Generic validation middleware
export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        })),
      });
    }

    next();
  };
};

// User validation schemas
export const userSchemas = {
  updateProfile: Joi.object({
    full_name: Joi.string().min(2).max(100).optional(),
    phone: Joi.string()
      .pattern(/^\+?[\d\s\-\(\)]+$/)
      .optional(),
    avatar_url: Joi.string().uri().optional(),
    bio: Joi.string().max(500).optional(),
    timezone: Joi.string().optional(),
  }),

  updateGlobalRole: Joi.object({
    global_role: Joi.string().valid("super_admin", "user").required(),
  }),
};

// Company validation schemas
export const companySchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500).optional(),
    logo_url: Joi.string().uri().optional(),
    website: Joi.string().uri().optional(),
    industry: Joi.string().max(100).optional(),
    size: Joi.string()
      .valid("startup", "small", "medium", "large", "enterprise")
      .optional(),
    settings: Joi.object().optional(),
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    description: Joi.string().max(500).optional(),
    logo_url: Joi.string().uri().optional(),
    website: Joi.string().uri().optional(),
    industry: Joi.string().max(100).optional(),
    size: Joi.string()
      .valid("startup", "small", "medium", "large", "enterprise")
      .optional(),
    settings: Joi.object().optional(),
  }),
};

// Membership validation schemas
export const membershipSchemas = {
  create: Joi.object({
    user_id: Joi.string().uuid().required(),
    company_id: Joi.string().uuid().required(),
    role: Joi.string()
      .valid("admin", "dev", "bug_reporter", "viewer")
      .required(),
    title: Joi.string().max(100).optional(),
    department: Joi.string().max(100).optional(),
    permissions: Joi.object().optional(),
  }),

  update: Joi.object({
    role: Joi.string()
      .valid("admin", "dev", "bug_reporter", "viewer")
      .optional(),
    title: Joi.string().max(100).optional(),
    department: Joi.string().max(100).optional(),
    permissions: Joi.object().optional(),
    status: Joi.string()
      .valid("active", "inactive", "pending", "suspended")
      .optional(),
  }),

  invite: Joi.object({
    email: Joi.string().email().required(),
    role: Joi.string()
      .valid("admin", "dev", "bug_reporter", "viewer")
      .required(),
    title: Joi.string().max(100).optional(),
    department: Joi.string().max(100).optional(),
    permissions: Joi.object().optional(),
  }),
};

// Query parameter validation
export const querySchemas = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().max(100).optional(),
    sort_by: Joi.string()
      .valid("created_at", "name", "email", "role")
      .optional(),
    sort_order: Joi.string().valid("asc", "desc").default("desc"),
  }),
};

// ID parameter validation
export const idParamSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

// UUID parameter validation
export const uuidParamSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  companyId: Joi.string().uuid().required(),
});
