import express from 'express';
import {
  createProject,
  getProject,
  updateProject,
  deleteProject,
  getCompanyProjects,
  searchProjects
} from '../controllers/projectController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All project routes require authentication
router.use(authenticateToken);

// Project CRUD routes
router.post('/companies/:companyId/projects', createProject);
router.get('/companies/:companyId/projects', getCompanyProjects);
router.get('/companies/:companyId/projects/search', searchProjects);
router.get('/projects/:projectId', getProject);
router.put('/projects/:projectId', updateProject);
router.delete('/projects/:projectId', deleteProject);

export default router;