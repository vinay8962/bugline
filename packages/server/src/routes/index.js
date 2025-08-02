import express from "express";
import userRoutes from "./userRoutes.js";
import companyRoutes from "./companyRoutes.js";
import projectRoutes from "./projectRoutes.js";
import bugRoutes from "./bugRoutes.js";
import adminRoutes from "./adminRoutes.js";
import authRoutes from "./authRoutes.js";
import { checkDatabaseConnection } from "../config/prisma.js";
import { API } from "../config/constants.js";

const router = express.Router();

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
        register: `POST ${API.VERSION}/auth/register`,
        login: `POST ${API.VERSION}/auth/login`,
        verifyEmail: `POST ${API.VERSION}/auth/verify-email`,
        resendVerification: `POST ${API.VERSION}/auth/resend-verification`,
        forgotPassword: `POST ${API.VERSION}/auth/forgot-password`,
        resetPassword: `POST ${API.VERSION}/auth/reset-password`,
        getCurrentUser: `GET ${API.VERSION}/auth/me`
      },
      users: `GET ${API.VERSION}/users`,
      companies: `GET ${API.VERSION}/companies`,
      projects: `GET ${API.VERSION}/companies/:companyId/projects`,
      bugs: `POST ${API.VERSION}/bugs (public), GET ${API.VERSION}/projects/:projectId/bugs`,
      admin: `POST ${API.VERSION}/admin/companies/:companyId/users`,
    },
    documentation: "https://github.com/your-repo/docs",
  });
});

// Mount route modules
router.use(`${API.VERSION}/auth`, authRoutes);
router.use(`${API.VERSION}/users`, userRoutes);
router.use(`${API.VERSION}/companies`, companyRoutes);
router.use(`${API.VERSION}`, projectRoutes); // Projects are nested under companies
router.use(`${API.VERSION}`, bugRoutes); // Bugs are nested under projects
router.use(`${API.VERSION}/admin`, adminRoutes);

// 404 handler for undefined routes
router.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      "/health",
      "/docs",
      `${API.VERSION}/auth`,
      `${API.VERSION}/users`,
      `${API.VERSION}/companies`,
      `${API.VERSION}/projects`,
      `${API.VERSION}/bugs`,
      `${API.VERSION}/admin`,
    ],
  });
});

export default router;
