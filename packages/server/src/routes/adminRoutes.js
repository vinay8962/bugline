import express from "express";
import { AdminController } from "../controllers/adminController.js";
import { authenticateToken } from "../middleware/auth.js";
import { validate, adminSchemas } from "../middleware/validation.js";
import { requireSuperAdmin } from "../middleware/superAdminValidator.js";

const router = express.Router();

// Public route for email verification
router.post("/verify-email", AdminController.verifyEmail);

// Protected routes - require authentication
router.use(authenticateToken, requireSuperAdmin);

// Company admin routes - require company admin access
router.post(
  "/companies/:companyId/users",
  validate(adminSchemas.createUser),
  AdminController.createUserForCompany
);

router.post(
  "/companies/:companyId/users/bulk",
  validate(adminSchemas.bulkCreateUsers),
  AdminController.bulkCreateUsers
);

router.get(
  "/companies/:companyId/users",
  AdminController.getCompanyTeamMembers
);

router.put(
  "/companies/:companyId/users/:userId/role",
  validate(adminSchemas.updateUserRole),
  AdminController.updateUserRole
);

router.delete(
  "/companies/:companyId/users/:userId",
  AdminController.removeUserFromCompany
);

router.put(
  "/companies/:companyId/users/:userId/suspend",
  validate(adminSchemas.suspendUser),
  AdminController.suspendUser
);

router.put(
  "/companies/:companyId/users/:userId/reactivate", 
  AdminController.reactivateUser
);

// Email verification management
router.post(
  "/users/:userId/resend-verification",
  validate(adminSchemas.resendVerification),
  AdminController.resendEmailVerification
);

router.get(
  "/users/:userId/email-status",
  AdminController.getEmailVerificationStatus
);

export default router;