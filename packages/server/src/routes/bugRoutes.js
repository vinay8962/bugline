import express from 'express';
import { BugController } from '../controllers/bugController.js';
import { authenticateToken } from '../middleware/authPrisma.js';

const router = express.Router();

// Public routes (for widget)
router.post('/bugs', BugController.createBug); // Public for anonymous bug reporting

// Protected routes
router.use(authenticateToken);

// Bug CRUD routes
router.get('/bugs/:bugId', BugController.getBug);
router.put('/bugs/:bugId', BugController.updateBug);
router.delete('/bugs/:bugId', BugController.deleteBug);

// Bug assignment routes
router.post('/bugs/:bugId/assign', BugController.assignBug);
router.post('/bugs/:bugId/unassign', BugController.unassignBug);

// Bug listing routes
router.get('/projects/:projectId/bugs', BugController.getProjectBugs);
router.get('/projects/:projectId/bugs/search', BugController.searchBugs);
router.get('/companies/:companyId/bugs', BugController.getCompanyBugs);
router.get('/users/me/bugs', BugController.getUserAssignedBugs);

export default router;