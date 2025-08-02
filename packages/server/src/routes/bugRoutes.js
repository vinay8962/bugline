import express from 'express';
import {
  createBug,
  getBug,
  updateBug,
  deleteBug,
  assignBug,
  unassignBug,
  getProjectBugs,
  searchBugs,
  getCompanyBugs,
  getUserAssignedBugs
} from '../controllers/bugController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes (for widget)
router.post('/bugs', createBug); // Public for anonymous bug reporting

// Protected routes
router.use(authenticateToken);

// Bug CRUD routes
router.get('/bugs/:bugId', getBug);
router.put('/bugs/:bugId', updateBug);
router.delete('/bugs/:bugId', deleteBug);

// Bug assignment routes
router.post('/bugs/:bugId/assign', assignBug);
router.post('/bugs/:bugId/unassign', unassignBug);

// Bug listing routes
router.get('/projects/:projectId/bugs', getProjectBugs);
router.get('/projects/:projectId/bugs/search', searchBugs);
router.get('/companies/:companyId/bugs', getCompanyBugs);
router.get('/users/me/bugs', getUserAssignedBugs);

export default router;