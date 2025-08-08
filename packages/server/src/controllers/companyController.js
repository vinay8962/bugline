import * as CompanyService from "../services/companyService.js";
import * as AdminService from "../services/adminService.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { sendSuccess, sendError } from "../utils/responseHelpers.js";

// Create company
export const createCompany = asyncHandler(async (req, res) => {
  const companyData = req.body;
  const creatorId = req.user.id;

  const company = await CompanyService.createCompany(companyData, creatorId);

  sendSuccess(res, company, "Company created successfully", 201);
});

// Get all companies
export const getCompanies = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, name } = req.query;

  const filters = {};
  if (name) filters.name = name;

  const result = await CompanyService.getAllCompanies(
    parseInt(page),
    parseInt(limit),
    filters
  );

  sendSuccess(
    res,
    result.companies,
    "Companies retrieved successfully",
    200,
    result.pagination
  );
});

// Get company by ID
export const getCompany = asyncHandler(async (req, res) => {
  const { companyId } = req.params;

  const company = await CompanyService.getCompanyById(companyId);

  sendSuccess(res, company, "Company retrieved successfully");
});

// Update company
export const updateCompany = asyncHandler(async (req, res) => {
  const { companyId } = req.params;
  const updateData = req.body;

  const company = await CompanyService.updateCompany(companyId, updateData);

  sendSuccess(res, company, "Company updated successfully");
});

// Delete company
export const deleteCompany = asyncHandler(async (req, res) => {
  const { companyId } = req.params;

  const result = await CompanyService.deleteCompany(companyId);

  sendSuccess(res, null, result.message);
});

// Search companies
export const searchCompanies = asyncHandler(async (req, res) => {
  const { q: searchTerm, limit = 10 } = req.query;

  const companies = await CompanyService.searchCompanies(
    searchTerm,
    parseInt(limit)
  );

  sendSuccess(res, companies, "Companies search completed successfully");
});

// Company member management
export const getCompanyMembers = asyncHandler(async (req, res) => {
  const { companyId } = req.params;

  const members = await CompanyService.getCompanyMembers(companyId);

  sendSuccess(res, members, "Company members retrieved successfully");
});

export const addUserToCompany = asyncHandler(async (req, res) => {
  const { companyId } = req.params;
  const {
    userId,
    email,
    full_name,
    phone,
    password,
    role = "OTHERS",
  } = req.body;

  let result;

  if (userId) {
    // Add existing user to company
    result = await CompanyService.addUserToCompany(userId, companyId, role);
    sendSuccess(res, result, "User added to company successfully", 201);
  } else if (email && full_name && password) {
    // Create new user and add to company
    const userData = {
      email,
      full_name,
      phone,
      password,
      role,
    };

    result = await AdminService.createUserForCompany(
      companyId,
      userData,
      req.user.id
    );

    const message = result.isNewUser
      ? "User created and added to company successfully"
      : "Existing user added to company successfully";

    sendSuccess(res, result, message, 201);
  } else {
    return sendError(
      res,
      "Either userId or (email, full_name, password) must be provided",
      400
    );
  }
});

export const removeUserFromCompany = asyncHandler(async (req, res) => {
  const { companyId, userId } = req.params;

  const result = await CompanyService.removeUserFromCompany(userId, companyId);

  sendSuccess(res, null, result.message);
});

export const updateUserCompanyRole = asyncHandler(async (req, res) => {
  const { companyId, userId } = req.params;
  const { role } = req.body;

  const companyUser = await CompanyService.updateUserRole(
    userId,
    companyId,
    role
  );

  sendSuccess(res, companyUser, "User role updated successfully");
});
