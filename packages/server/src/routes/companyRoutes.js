import express from "express";
import {
  createCompany,
  getCompanies,
  getCompany,
  updateCompany,
  deleteCompany,
  searchCompanies,
  getCompanyMembers,
  addUserToCompany,
  removeUserFromCompany,
  updateUserCompanyRole
} from "../controllers/companyController.js";
import {
  authenticateToken,
  requireCompanyAccess,
  requireCompanyAdmin,
} from "../middleware/auth.js";
import { requireSuperAdmin } from "../middleware/superAdminValidator.js";
import { validate, companySchemas } from "../middleware/validation.js";

const router = express.Router();



// Protected routes - require authentication
router.use(authenticateToken);

// Public routes (if any)
router.get("/search", searchCompanies);

/**
 * @swagger
 * tags:
 *   - name: Companies
 *     description: Company management operations (Super Admin only)
 *   - name: Company Management
 *     description: Individual company operations
 */

/**
 * @swagger
 * /api/v1/companies:
 *   get:
 *     summary: Get all companies (Super Admin only)
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Companies list
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
 *                         companies:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Company'
 *                         pagination:
 *                           $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Super Admin required
 */
router.get("/", requireSuperAdmin, getCompanies);
router.post(
  "/",
  validate(companySchemas.create),
  createCompany
);

// Company-specific routes
router.get(
  "/:companyId",
  requireCompanyAccess,
  getCompany
);
router.put(
  "/:companyId",
  requireCompanyAdmin,
  validate(companySchemas.update),
  updateCompany
);
router.delete(
  "/:companyId",
  requireCompanyAdmin,
  deleteCompany
);
router.get(
  "/:companyId/members",
  requireCompanyAccess,
  getCompanyMembers
);
router.post(
  "/:companyId/members",
  requireCompanyAdmin,
  addUserToCompany
);
router.delete(
  "/:companyId/members/:userId",
  requireCompanyAdmin,
  removeUserFromCompany
);
router.put(
  "/:companyId/members/:userId/role",
  requireCompanyAdmin,
  updateUserCompanyRole
);

export default router;
