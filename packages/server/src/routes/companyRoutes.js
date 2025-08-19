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
  updateUserCompanyRole,
  getCompanyStats,
} from "../controllers/companyController.js";
import {
  createProject,
  getCompanyProjects,
  searchProjects,
  getProject,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";
import {
  authenticateToken,
  requireCompanyAccess,
  requireCompanyAdmin,
  requireSpecificCompanyAdmin,
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
router.post("/", validate(companySchemas.create), createCompany);

// Company-specific routes
router.get("/:companyId", requireCompanyAccess, getCompany);
router.put(
  "/:companyId",
  requireCompanyAdmin,
  validate(companySchemas.update),
  updateCompany
);
router.delete("/:companyId", requireCompanyAdmin, deleteCompany);
/**
 * @swagger
 * /api/v1/companies/{companyId}/members:
 *   get:
 *     summary: Get company members
 *     tags: [Company Management]
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
 *     responses:
 *       200:
 *         description: Company members list
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
 *                         $ref: '#/components/schemas/CompanyUser'
 *       403:
 *         description: Forbidden - Company access required
 *       404:
 *         description: Company not found
 */
router.get("/:companyId/members", requireCompanyAccess, getCompanyMembers);
/**
 * @swagger
 * /api/v1/companies/{companyId}/members:
 *   post:
 *     summary: Add user to company or create new user
 *     tags: [Company Management]
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
 *             oneOf:
 *               - type: object
 *                 title: Add existing user
 *                 required:
 *                   - userId
 *                 properties:
 *                   userId:
 *                     type: string
 *                     format: uuid
 *                     description: Existing user ID
 *                   role:
 *                     type: string
 *                     enum: [ADMIN, DEVELOPER, QA, OTHERS]
 *                     default: OTHERS
 *                     description: User role in company
 *               - type: object
 *                 title: Create new user
 *                 required:
 *                   - email
 *                   - full_name
 *                   - password
 *                 properties:
 *                   email:
 *                     type: string
 *                     format: email
 *                     description: User email
 *                   full_name:
 *                     type: string
 *                     description: User full name
 *                   phone:
 *                     type: string
 *                     description: User phone number
 *                   password:
 *                     type: string
 *                     minLength: 8
 *                     description: User password
 *                   role:
 *                     type: string
 *                     enum: [ADMIN, DEVELOPER, QA, OTHERS]
 *                     default: OTHERS
 *                     description: User role in company
 *     responses:
 *       201:
 *         description: User added to company successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden - Company admin required
 *       404:
 *         description: Company not found
 */
router.post(
  "/:companyId/members",
  requireSpecificCompanyAdmin,
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

// Company stats route
router.get("/:companyId/stats", requireCompanyAccess, getCompanyStats);

router.post("/:companyId/projects", requireSpecificCompanyAdmin, createProject);
router.get("/:companyId/projects", requireCompanyAccess, getCompanyProjects);
router.get("/:companyId/projects/search", requireCompanyAccess, searchProjects);
router.get("/projects/:projectId", requireCompanyAccess, getProject);
router.put("/projects/:projectId", requireCompanyAdmin, updateProject);
router.delete("/projects/:projectId", requireCompanyAdmin, deleteProject);

export default router;
