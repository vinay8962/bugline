import express from "express";
import { AdminController } from "../controllers/adminController.js";
import { authenticateToken } from "../middleware/auth.js";
import { validate, adminSchemas } from "../middleware/validation.js";
import { requireSuperAdmin } from "../middleware/superAdminValidator.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Admin operations for user and company management
 */

// Public route for email verification
router.post("/verify-email", AdminController.verifyEmail);

// Protected routes - require authentication
router.use(authenticateToken, requireSuperAdmin);

/**
 * @swagger
 * /api/v1/admin/companies/{companyId}/users:
 *   post:
 *     summary: Create user for company (Super Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:  
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Company ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - full_name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *               full_name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: User full name
 *               phone:
 *                 type: string
 *                 description: User phone number
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: User password
 *               role:
 *                 type: string
 *                 enum: [ADMIN, DEVELOPER, QA, OTHERS]
 *                 description: User role in company
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         isNewUser:
 *                           type: boolean
 *                           description: Whether user was newly created or existing
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden - Super Admin required
 *       404:
 *         description: Company not found
 */
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