import express from "express";
import { UserController } from "../controllers/userController.js";
import { authenticateToken } from "../middleware/auth.js";
import { validate, userSchemas } from "../middleware/validation.js";
import { requireSuperAdmin } from "../middleware/superAdminValidator.js";

const router = express.Router();

// Public routes (if any)
// router.get('/public/profile/:userId', UserController.getPublicUserProfile);

// Protected routes - require authentication
router.use(authenticateToken);

// Current user routes
router.get("/me", UserController.getCurrentUser);
router.put(
  "/me",
  validate(userSchemas.updateProfile),
  UserController.updateCurrentUser
);
router.get("/me/companies", UserController.getUserCompanies);
router.get("/me/stats", UserController.getCurrentUserStats);

// User management routes (admin only)
router.get("/", UserController.getUsers);
router.get("/search", UserController.searchUsers);
router.get("/:userId", UserController.getUserById);
router.put(
  "/:userId",
  validate(userSchemas.updateProfile),
  UserController.updateUser
);
router.delete("/:userId", UserController.deleteUser);
router.get("/:userId/companies", UserController.getUserCompanies);
router.get("/:userId/stats", UserController.getUserStats);

// Super admin only routes
router.put(
  "/:userId/role",
  requireSuperAdmin,
  validate(userSchemas.updateGlobalRole),
  UserController.updateUserRole
);

// Email lookup (admin only)
router.get("/email/:email", UserController.getUserByEmail);

export default router;
