import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
import { asyncHandler } from "./errorHandler.js";
// Basic authentication middleware
export const authenticateToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token required",
    });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database - only load essential data for authentication
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        full_name: true,
        global_role: true,
        // Remove heavy company_users include - load only when specifically needed
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token or user not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Authentication error",
    });
  }
});

// Check if user has access to company (any role)
export const requireCompanyAccess = asyncHandler(async (req, res, next) => {
  let { companyId } = req.params;
  const { projectId } = req.params;

  // If no companyId but we have projectId, get companyId from project
  if (!companyId && projectId) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { company_id: true },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    companyId = project.company_id;
  }

  if (!companyId) {
    return res.status(400).json({
      success: false,
      message: "Company ID is required",
    });
  }

  // Super admins have access to all companies
  if (req.user.global_role === "SUPER_ADMIN") {
    return next();
  }

  // Check if user is member of the company
  const companyUser = await prisma.companyUser.findUnique({
    where: {
      user_id_company_id: {
        user_id: req.user.id,
        company_id: companyId,
      },
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!companyUser) {
    return res.status(403).json({
      success: false,
      message: "Company access required",
    });
  }

  req.companyUser = companyUser;
  next();
});

// Check if user has specific company role
export const requireCompanyRole = (requiredRoles) => {
  // Allow single role or array of roles
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

  return asyncHandler(async (req, res, next) => {
    // Super admins bypass company role checks
    if (req.user.global_role === "SUPER_ADMIN") {
      return next();
    }

    // Load user's company roles only when needed (not in every auth check)
    const userWithCompanies = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        company_users: {
          select: {
            role: true,
            company_id: true,
          },
        },
      },
    });

    if (!userWithCompanies?.company_users?.length) {
      return res.status(403).json({
        success: false,
        message: "Company membership required",
      });
    }

    // Check if user has required role in any company
    const hasRequiredRole = userWithCompanies.company_users.some(
      (companyUser) => roles.includes(companyUser.role)
    );

    if (!hasRequiredRole) {
      return res.status(403).json({
        success: false,
        message: `Required role: ${roles.join(" or ")}`,
      });
    }

    next();
  });
};

// Check if user can manage company (ADMIN role)
export const requireCompanyAdmin = requireCompanyRole(["ADMIN"]);

// Check if user is admin of the specific company in the request
export const requireSpecificCompanyAdmin = asyncHandler(
  async (req, res, next) => {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID is required",
      });
    }

    // Super admins bypass company role checks
    if (req.user.global_role === "SUPER_ADMIN") {
      return next();
    }

    // Check if user is admin of this specific company
    const companyUser = await prisma.companyUser.findUnique({
      where: {
        user_id_company_id: {
          user_id: req.user.id,
          company_id: companyId,
        },
      },
    });

    if (!companyUser || companyUser.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Company admin access required for this company",
      });
    }

    req.companyUser = companyUser;
    next();
  }
);

// Check if user can manage bugs (ADMIN, DEVELOPER, QA)
export const requireBugManagement = requireCompanyRole([
  "ADMIN",
  "DEVELOPER",
  "QA",
]);

// Check if user can assign bugs (ADMIN, DEVELOPER)
export const requireBugAssignment = requireCompanyRole(["ADMIN", "DEVELOPER"]);

// Check if user owns the resource or has admin access
export const requireOwnershipOrAdmin = (getUserIdFromReq) => {
  return asyncHandler(async (req, res, next) => {
    const resourceUserId = getUserIdFromReq(req);

    // Super admins can access anything
    if (req.user.global_role === "SUPER_ADMIN") {
      return next();
    }

    // Users can access their own resources
    if (req.user.id === resourceUserId) {
      return next();
    }

    // Company admins can access resources of their company members
    if (req.companyUser && req.companyUser.role === "ADMIN") {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Access denied: insufficient permissions",
    });
  });
};

// Optional authentication (for endpoints that work with or without auth)
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        full_name: true,
        global_role: true,
      },
    });

    req.user = user;
  } catch (error) {
    req.user = null;
  }

  next();
});
