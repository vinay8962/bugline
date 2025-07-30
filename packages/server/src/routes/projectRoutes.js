import express from 'express';
import { ProjectController } from '../controllers/projectController.js';
import { authenticateToken } from '../middleware/authPrisma.js';

const router = express.Router();

// All project routes require authentication
router.use(authenticateToken);

// Project CRUD routes
router.post('/companies/:companyId/projects', ProjectController.createProject);
router.get('/companies/:companyId/projects', ProjectController.getCompanyProjects);
router.get('/companies/:companyId/projects/search', ProjectController.searchProjects);
router.get('/projects/:projectId', ProjectController.getProject);
router.put('/projects/:projectId', ProjectController.updateProject);
router.delete('/projects/:projectId', ProjectController.deleteProject);

export default router;