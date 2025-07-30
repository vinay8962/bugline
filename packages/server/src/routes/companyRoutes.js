import express from "express";
import { CompanyController } from "../controllers/companyController.js";
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
router.get("/search", CompanyController.searchCompanies);

// Company management routes
router.get("/", CompanyController.getCompanies);
router.post(
  "/",
  validate(companySchemas.create),
  CompanyController.createCompany
);

// Company-specific routes
router.get(
  "/:companyId",
  requireCompanyAccess,
  CompanyController.getCompanyById
);
router.put(
  "/:companyId",
  requireCompanyAdmin,
  validate(companySchemas.update),
  CompanyController.updateCompany
);
router.delete(
  "/:companyId",
  requireCompanyAdmin,
  CompanyController.deleteCompany
);
router.get(
  "/:companyId/users",
  requireCompanyAccess,
  CompanyController.getCompanyUsers
);
router.get(
  "/:companyId/stats",
  requireCompanyAccess,
  CompanyController.getCompanyStats
);
router.put(
  "/:companyId/settings",
  requireCompanyAdmin,
  CompanyController.updateCompanySettings
);

// User's companies
router.get("/user/:userId", CompanyController.getUserCompanies);
router.get("/me/companies", CompanyController.getCurrentUserCompanies);

export default router;
