/**
 * Widget Authentication Middleware
 * Validates project tokens for widget API access
 */

import { prisma } from "../config/prisma.js";
import { createAppError } from "./errorHandler.js";
import { logInfo, logError, logSecurity } from "../utils/logger.js";

/**
 * Middleware to authenticate widget requests using project tokens
 */
export const authenticateWidget = async (req, res, next) => {
  try {
    console.log(
      "🔍 authenticateWidget called for:",
      req.method,
      req.originalUrl
    );
    // Extract project token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logSecurity("Widget auth failed - no token provided", {
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        origin: req.get("Origin"),
      });
      throw createAppError("Project token is required", 401);
    }

    const projectToken = authHeader.substring(7); // Remove "Bearer " prefix

    // Print the Prisma query for debugging
    console.log("[DEBUG] Prisma project.findUnique query:", {
      where: { project_token: projectToken },
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
    // Find project by token
    const project = await prisma.project.findUnique({
      where: { project_token: projectToken },
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

    if (!project) {
      logSecurity("Widget auth failed - invalid token", {
        token: projectToken.substring(0, 8) + "...", // Log only first 8 chars for security
        ip: req.ip,
        origin: req.get("Origin"),
      });
      throw createAppError("Invalid project token", 401);
    }

    // Validate domain restrictions if configured
    const origin = req.get("Origin") || req.get("Referer");
    if (
      origin &&
      project.allowed_domains &&
      Array.isArray(project.allowed_domains) &&
      project.allowed_domains.length > 0
    ) {
      const originUrl = new URL(origin);
      const isAllowedDomain = project.allowed_domains.some((domain) => {
        // Support wildcard subdomains (*.example.com)
        if (domain.startsWith("*.")) {
          const baseDomain = domain.substring(2);
          return (
            originUrl.hostname === baseDomain ||
            originUrl.hostname.endsWith("." + baseDomain)
          );
        }
        return originUrl.hostname === domain;
      });

      if (!isAllowedDomain) {
        logSecurity("Widget auth failed - domain not allowed", {
          projectId: project.id,
          origin: originUrl.hostname,
          allowedDomains: project.allowed_domains,
          ip: req.ip,
        });
        throw createAppError("Domain not allowed for this project", 403);
      }
    }

    // Add project and company info to request
    req.project = project;
    req.company = project.company;

    logInfo("Widget authentication successful", {
      projectId: project.id,
      companyId: project.company.id,
      origin: req.get("Origin"),
      ip: req.ip,
    });

    next();
  } catch (error) {
    logError("Widget authentication error", {
      error: error.message,
      ip: req.ip,
      origin: req.get("Origin"),
    });
    next(error);
  }
};

/**
 * Middleware to validate widget configuration
 */
export const validateWidgetConfig = (req, res, next) => {
  try {
    const { title, description } = req.body;

    // Basic validation for required bug report fields
    if (!title || title.trim().length === 0) {
      throw createAppError("Bug title is required", 400);
    }

    if (!description || description.trim().length === 0) {
      throw createAppError("Bug description is required", 400);
    }

    // Limit field lengths to prevent abuse
    if (title.length > 500) {
      throw createAppError("Bug title must be less than 500 characters", 400);
    }

    if (description.length > 10000) {
      throw createAppError(
        "Bug description must be less than 10,000 characters",
        400
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to sanitize widget bug report data
 */
export const sanitizeWidgetData = (req, res, next) => {
  try {
    const { title, description, reporter_email, error_details, environment } =
      req.body;

    // Sanitize required fields
    req.body.title = title?.trim();
    req.body.description = description?.trim();
    req.body.source = "widget"; // Mark as widget submission

    // Sanitize optional fields
    if (reporter_email) {
      req.body.reporter_email = reporter_email.trim().toLowerCase();

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(req.body.reporter_email)) {
        throw createAppError("Invalid email format", 400);
      }
    }

    // Sanitize and validate error_details JSON
    if (error_details && typeof error_details === "object") {
      const sanitizedErrorDetails = {};

      // Allow specific error detail fields
      const allowedErrorFields = [
        "message",
        "stack",
        "filename",
        "lineno",
        "colno",
        "type",
      ];
      allowedErrorFields.forEach((field) => {
        if (error_details[field] !== undefined) {
          sanitizedErrorDetails[field] = String(error_details[field]).substring(
            0,
            5000
          ); // Limit length
        }
      });

      req.body.error_details = sanitizedErrorDetails;
    }

    // Sanitize and validate environment JSON
    if (environment && typeof environment === "object") {
      const sanitizedEnvironment = {};

      // Allow specific environment fields
      const allowedEnvFields = [
        "userAgent",
        "url",
        "timestamp",
        "viewport",
        "language",
      ];
      allowedEnvFields.forEach((field) => {
        if (environment[field] !== undefined) {
          sanitizedEnvironment[field] = String(environment[field]).substring(
            0,
            1000
          ); // Limit length
        }
      });

      req.body.environment = sanitizedEnvironment;
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default {
  authenticateWidget,
  validateWidgetConfig,
  sanitizeWidgetData,
};
