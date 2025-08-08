import express from "express";
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
  getUserAssignedBugs,
} from "../controllers/bugController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Public routes (for widget)
router.post("/", createBug); // Public for anonymous bug reporting

// Protected routes
router.use(authenticateToken);

// Bug CRUD routes
router.get("/:bugId", getBug);
router.put("/:bugId", updateBug);
router.delete("/:bugId", deleteBug);

// Bug assignment routes
router.post("/:bugId/assign", assignBug);
router.post("/:bugId/unassign", unassignBug);

// Bug listing routes
router.get("/projects/:projectId", getProjectBugs);
router.get("/projects/:projectId/search", searchBugs);
router.get("/companies/:companyId", getCompanyBugs);
router.get("/users/me", getUserAssignedBugs);

export default router;
