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

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: User management operations
 *   - name: User Profile
 *     description: Current user profile operations
 */

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/me", getCurrentUser);

/**
 * @swagger
 * /api/v1/users/me:
 *   put:
 *     summary: Update current user profile
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: John Doe
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               bio:
 *                 type: string
 *                 example: Software Developer
 *               location:
 *                 type: string
 *                 example: San Francisco, CA
 *               timezone:
 *                 type: string
 *                 example: America/Los_Angeles
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  "/me",
  validate(userSchemas.updateProfile),
  updateCurrentUser
);

/**
 * @swagger
 * /api/v1/users/me/companies:
 *   get:
 *     summary: Get current user's companies
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's companies list
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/UserCompany'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/me/companies", (req, res) => {
  // Set userId to current user's ID for getUserCompanies function
  req.params.userId = req.user.id;
  getUserCompanies(req, res);
});

/**
 * @swagger
 * /api/v1/users/me/stats:
 *   get:
 *     summary: Get current user statistics
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/me/stats", getCurrentUserStats);

// User management routes (admin only)
router.get("/:userId", getUserById);
router.put(
  "/:userId",
  validate(userSchemas.updateProfile),
  updateUser
);
router.get("/:userId/companies", getUserCompanies);
router.get("/:userId/stats", getUserStats);

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users (Super Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: global_role
 *         schema:
 *           type: string
 *           enum: [SUPER_ADMIN, USER]
 *         description: Filter by global role
 *     responses:
 *       200:
 *         description: Users list with pagination
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Super Admin required
 */
router.get("/", requireSuperAdmin, getUsers);

/**
 * @swagger
 * /api/v1/users/search:
 *   get:
 *     summary: Search users (Super Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum results
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Super Admin required
 */
router.get("/search", requireSuperAdmin, searchUsers);

/**
 * @swagger
 * /api/v1/users/{userId}:
 *   delete:
 *     summary: Delete user (Super Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Super Admin required
 *       404:
 *         description: User not found
 */
router.delete("/:userId", requireSuperAdmin, deleteUser);

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
