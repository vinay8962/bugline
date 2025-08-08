import express from 'express';
import {
  createProject,
  getProject,
  updateProject,
  deleteProject,
  getCompanyProjects,
  searchProjects
} from '../controllers/projectController.js';
import { authenticateToken, requireCompanyAccess, requireCompanyAdmin } from '../middleware/auth.js';

const router = express.Router();

// All project routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   - name: Projects
 *     description: Project management operations
 */

/**
 * @swagger
 * /api/v1/companies/{companyId}/projects:
 *   get:
 *     summary: Get company projects
 *     tags: [Projects]
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
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Projects list
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
 *                         $ref: '#/components/schemas/Project'
 *       403:
 *         description: Forbidden - Company access required
 *   post:
 *     summary: Create new project
 *     tags: [Projects]
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
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Project name
 *               slug:
 *                 type: string
 *                 description: Project slug
 *     responses:
 *       201:
 *         description: Project created successfully
 *       403:
 *         description: Forbidden - Company admin required
 */

// Project CRUD routes
router.post('/companies/:companyId/projects', requireCompanyAdmin, createProject);
router.get('/companies/:companyId/projects', requireCompanyAccess, getCompanyProjects);
router.get('/companies/:companyId/projects/search', requireCompanyAccess, searchProjects);
router.get('/projects/:projectId', requireCompanyAccess, getProject);
router.put('/projects/:projectId', requireCompanyAdmin, updateProject);
router.delete('/projects/:projectId', requireCompanyAdmin, deleteProject);

export default router;