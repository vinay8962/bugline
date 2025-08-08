/**
 * Widget API Routes
 * Public routes for BugLine widget integration
 */

import express from "express";
import {
  validateProjectToken,
  reportBug,
  getWidgetConfig,
  updateWidgetSettings,
  getWidgetStats,
} from "../controllers/widgetController.js";
import {
  authenticateWidget,
  validateWidgetConfig,
  sanitizeWidgetData,
} from "../middleware/widgetAuth.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Public widget routes (authenticated with project token)
router.use("/", authenticateWidget);

// Widget token validation
router.get("/validate", authenticateWidget, validateProjectToken);

// Widget configuration
router.get("/config", getWidgetConfig);

// Bug reporting from widget
router.post(
  "/bugs/report",
  validateWidgetConfig,
  sanitizeWidgetData,
  reportBug
);

// Internal widget management routes (require user authentication)
router.put(
  "/projects/:projectId/widget/settings",
  authenticateToken,
  updateWidgetSettings
);

router.get(
  "/projects/:projectId/widget/stats",
  authenticateToken,
  getWidgetStats
);

export default router;
