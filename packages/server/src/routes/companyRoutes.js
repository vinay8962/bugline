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
import { validate, companySchemas } from "../middleware/validation.js";

const router = express.Router();



// Protected routes - require authentication
router.use(authenticateToken);

// Public routes (if any)
router.get("/search", searchCompanies);

// Company management routes
router.get("/", getCompanies);
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
