import * as CompanyService from "../services/companyService.js";
import * as AdminService from "../services/adminService.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import {
  sendSuccess,
  sendError,
  createPagination,
} from "../utils/responseHelpers.js";
import {
  sanitizePagination,
  createPaginationResponse,
} from "../utils/paginationHelpers.js";

// Create company
export const createCompany = asyncHandler(async (req, res) => {
  const companyData = req.body;
  const creatorId = req.user.id;

  const company = await CompanyService.createCompany(companyData, creatorId);

  sendSuccess(res, company, "Company created successfully", 201);
});

// Get all companies
export const getCompanies = asyncHandler(async (req, res) => {
  const { page, limit, name } = req.query;

  // Apply pagination limits to prevent large data transfers
  const { page: sanitizedPage, limit: sanitizedLimit } = sanitizePagination(
    page,
    limit
  );

  const filters = {};
  if (name) filters.name = name;

  const result = await CompanyService.getAllCompanies(
    sanitizedPage,
    sanitizedLimit,
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

  res.json({
    success: true,
    data: company,
  });
});

// Update company
export const updateCompany = asyncHandler(async (req, res) => {
  const { companyId } = req.params;
  const updateData = req.body;

  const company = await CompanyService.updateCompany(companyId, updateData);

  res.json({
    success: true,
    data: company,
    message: "Company updated successfully",
  });
});

// Delete company
export const deleteCompany = asyncHandler(async (req, res) => {
  const { companyId } = req.params;

  const result = await CompanyService.deleteCompany(companyId);

  res.json({
    success: true,
    message: result.message,
  });
});

// Search companies
export const searchCompanies = asyncHandler(async (req, res) => {
  const { q: searchTerm, limit } = req.query;

  // Apply search term validation and limit constraints
  const { limit: sanitizedLimit } = sanitizePagination(1, limit || 10);

  if (!searchTerm || searchTerm.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: "Search term must be at least 2 characters long",
    });
  }

  const companies = await CompanyService.searchCompanies(
    searchTerm.trim(),
    sanitizedLimit
  );

  res.json({
    success: true,
    data: companies,
  });
});

// Company member management
export const getCompanyMembers = asyncHandler(async (req, res) => {
  const { companyId } = req.params;

  const members = await CompanyService.getCompanyMembers(companyId);

  res.json({
    success: true,
    data: members,
  });
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
    result = await CompanyService.addUserToCompany(companyId, userId, role);
    res.status(201).json({
      success: true,
      data: result,
      message: "User added to company successfully",
    });
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

    res.status(201).json({
      success: true,
      data: result,
      message: result.isNewUser
        ? "User created and added to company successfully"
        : "Existing user added to company successfully",
    });
  } else {
    return res.status(400).json({
      success: false,
      message: "Either userId or (email, full_name, password) must be provided",
    });
  }
});

export const removeUserFromCompany = asyncHandler(async (req, res) => {
  const { companyId, userId } = req.params;

  const result = await CompanyService.removeUserFromCompany(companyId, userId);

  res.json({
    success: true,
    message: result.message,
  });
});

export const updateUserCompanyRole = asyncHandler(async (req, res) => {
  const { companyId, userId } = req.params;
  const { role } = req.body;

  const companyUser = await CompanyService.updateUserRole(
    userId,
    companyId,
    role
  );

  res.json({
    success: true,
    data: companyUser,
    message: "User role updated successfully",
  });
});

// Get company statistics
export const getCompanyStats = asyncHandler(async (req, res) => {
  const { companyId } = req.params;

  const stats = await CompanyService.getCompanyStats(companyId);

  res.json({
    success: true,
    data: stats,
  });
});
