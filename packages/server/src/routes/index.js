import express from "express";
import userRoutes from "./userRoutes.js";
import companyRoutes from "./companyRoutes.js";
import projectRoutes from "./projectRoutes.js";
import bugRoutes from "./bugRoutes.js";
import adminRoutes from "./adminRoutes.js";
import authRoutes from "./authRoutes.js";
import { checkDatabaseConnection } from "../config/prisma.js";

const router = express.Router();

// API version prefix
const API_VERSION = "/api/v1";

// Health check endpoint
router.get("/health", async (req, res) => {
  try {
    // Check database connection
    await checkDatabaseConnection();
    
    res.status(200).json({
      success: true,
      message: "BugLine API is running",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      services: {
        database: "connected",
        api: "running"
      }
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: "Service unavailable",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      services: {
        database: "disconnected",
        api: "running"
      },
      error: error.message
    });
  }
});

// API documentation endpoint
router.get("/docs", (req, res) => {
  res.status(200).json({
    success: true,
    message: "BugLine API Documentation",
    version: "1.0.0",
    endpoints: {
      health: "GET /health",
      auth: {
        register: "POST /api/v1/auth/register",
        login: "POST /api/v1/auth/login",
        verifyEmail: "POST /api/v1/auth/verify-email",
        resendVerification: "POST /api/v1/auth/resend-verification",
        forgotPassword: "POST /api/v1/auth/forgot-password",
        resetPassword: "POST /api/v1/auth/reset-password",
        getCurrentUser: "GET /api/v1/auth/me"
      },
      users: "GET /api/v1/users",
      companies: "GET /api/v1/companies",
      projects: "GET /api/v1/companies/:companyId/projects",
      bugs: "POST /api/v1/bugs (public), GET /api/v1/projects/:projectId/bugs",
      admin: "POST /api/v1/admin/companies/:companyId/users",
    },
    documentation: "https://github.com/your-repo/docs",
  });
});

// Mount route modules
router.use(`${API_VERSION}/auth`, authRoutes);
router.use(`${API_VERSION}/users`, userRoutes);
router.use(`${API_VERSION}/companies`, companyRoutes);
router.use(`${API_VERSION}`, projectRoutes); // Projects are nested under companies
router.use(`${API_VERSION}`, bugRoutes); // Bugs are nested under projects
router.use(`${API_VERSION}/admin`, adminRoutes);

// 404 handler for undefined routes
router.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      "/health",
      "/docs",
      "/api/v1/auth",
      "/api/v1/users",
      "/api/v1/companies",
      "/api/v1/projects",
      "/api/v1/bugs",
      "/api/v1/admin",
    ],
  });
});

export default router;
