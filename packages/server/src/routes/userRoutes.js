import express from "express";
import {
  getUsers,
  getUserById,
  getCurrentUser,
  updateUser,
  updateCurrentUser,
  deleteUser,
  searchUsers,
  getUserCompanies,
  getUserByEmail,
  updateUserPassword,
  updateUserRole,
  getCurrentUserStats,
  getUserStats
} from "../controllers/userController.js";
import { authenticateToken } from "../middleware/auth.js";
import { validate, userSchemas } from "../middleware/validation.js";
import { requireSuperAdmin } from "../middleware/superAdminValidator.js";

const router = express.Router();

// Public routes (if any)
// router.get('/public/profile/:userId', UserController.getPublicUserProfile);

// Protected routes - require authentication
router.use(authenticateToken);

// Current user routes
router.get("/me", getCurrentUser);
router.put(
  "/me",
  validate(userSchemas.updateProfile),
  updateCurrentUser
);
router.get("/me/companies", getUserCompanies);
router.get("/me/stats", getCurrentUserStats);

// User management routes (admin only)
router.get("/", getUsers);
router.get("/search", searchUsers);
router.get("/:userId", getUserById);
router.put(
  "/:userId",
  validate(userSchemas.updateProfile),
  updateUser
);
router.delete("/:userId", deleteUser);
router.get("/:userId/companies", getUserCompanies);
router.get("/:userId/stats", getUserStats);

// Super admin only routes
router.put(
  "/:userId/role",
  requireSuperAdmin,
  validate(userSchemas.updateGlobalRole),
  updateUserRole
);

// Email lookup (admin only)
router.get("/email/:email", getUserByEmail);

export default router;
