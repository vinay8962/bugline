import jwt from "jsonwebtoken";
import { supabase } from "../config/database.js";

// Middleware to verify JWT token
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from Supabase
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", decoded.userId)
      .single();

    if (error || !user) {
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
};

// Middleware to check if user is super admin
export const requireSuperAdmin = (req, res, next) => {
  if (req.user.global_role !== "super_admin") {
    return res.status(403).json({
      success: false,
      message: "Super admin access required",
    });
  }
  next();
};

// Middleware to check if user is company admin
export const requireCompanyAdmin = async (req, res, next) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID is required",
      });
    }

    const { data: membership, error } = await supabase
      .from("memberships")
      .select("*")
      .eq("user_id", req.user.id)
      .eq("company_id", companyId)
      .eq("role", "admin")
      .eq("status", "active")
      .single();

    if (error || !membership) {
      return res.status(403).json({
        success: false,
        message: "Company admin access required",
      });
    }

    // Check if user's email is verified
    if (!req.user.email_verified) {
      return res.status(403).json({
        success: false,
        message: "Email verification required to perform admin actions",
      });
    }

    req.membership = membership;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Authorization error",
    });
  }
};

// Middleware to check if user has company access
export const requireCompanyAccess = async (req, res, next) => {
  try {
    const { companyId } = req.params;

    const { data: membership, error } = await supabase
      .from("memberships")
      .select("*")
      .eq("user_id", req.user.id)
      .eq("company_id", companyId)
      .eq("status", "active")
      .single();

    if (error || !membership) {
      return res.status(403).json({
        success: false,
        message: "Company access required",
      });
    }

    req.membership = membership;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Authorization error",
    });
  }
};

// Middleware to check specific permissions
export const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.membership) {
        return res.status(403).json({
          success: false,
          message: "Company membership required",
        });
      }

      const permissions = req.membership.permissions || {};

      if (!permissions[permission] && req.membership.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: `Permission '${permission}' required`,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Permission check error",
      });
    }
  };
};
