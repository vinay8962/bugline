import express from "express";
import userRoutes from "./userRoutes.js";
import companyRoutes from "./companyRoutes.js";
import membershipRoutes from "./membershipRoutes.js";

const router = express.Router();

// API version prefix
const API_VERSION = "/api/v1";

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "BugLine API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// API documentation endpoint
router.get("/docs", (req, res) => {
  res.status(200).json({
    success: true,
    message: "BugLine API Documentation",
    version: "1.0.0",
    endpoints: {
      health: "GET /health",
      users: "GET /api/v1/users",
      companies: "GET /api/v1/companies",
      memberships: "GET /api/v1/memberships",
    },
    documentation: "https://github.com/your-repo/docs",
  });
});

// Mount route modules
router.use(`${API_VERSION}/users`, userRoutes);
router.use(`${API_VERSION}/companies`, companyRoutes);
router.use(`${API_VERSION}/memberships`, membershipRoutes);

// 404 handler for undefined routes
router.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      "/health",
      "/docs",
      "/api/v1/users",
      "/api/v1/companies",
      "/api/v1/memberships",
    ],
  });
});

export default router;
