import * as CompanyService from '../services/companyService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sendSuccess, sendError, createPagination } from '../utils/responseHelpers.js';

// Create company
export const createCompany = asyncHandler(async (req, res) => {
  const companyData = req.body;
  const creatorId = req.user.id;
  
  const company = await CompanyService.createCompany(companyData, creatorId);
  
  sendSuccess(res, company, 'Company created successfully', 201);
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
  
  sendSuccess(res, result.companies, 'Companies retrieved successfully', 200, result.pagination);
});

// Get company by ID
export const getCompany = asyncHandler(async (req, res) => {
  const { companyId } = req.params;
  
  const company = await CompanyService.getCompanyById(companyId);
  
  res.json({
    success: true,
    data: company
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
    message: 'Company updated successfully'
  });
});

// Delete company
export const deleteCompany = asyncHandler(async (req, res) => {
  const { companyId } = req.params;
  
  const result = await CompanyService.deleteCompany(companyId);
  
  res.json({
    success: true,
    message: result.message
  });
});

// Search companies
export const searchCompanies = asyncHandler(async (req, res) => {
  const { q: searchTerm, limit = 10 } = req.query;
  
  const companies = await CompanyService.searchCompanies(searchTerm, parseInt(limit));
  
  res.json({
    success: true,
    data: companies
  });
});

// Company member management
export const getCompanyMembers = asyncHandler(async (req, res) => {
  const { companyId } = req.params;
  
  const members = await CompanyService.getCompanyMembers(companyId);
  
  res.json({
    success: true,
    data: members
  });
});

export const addUserToCompany = asyncHandler(async (req, res) => {
  const { companyId } = req.params;
  const { userId, role = 'OTHERS' } = req.body;
  
  const companyUser = await CompanyService.addUserToCompany(userId, companyId, role);
  
  res.status(201).json({
    success: true,
    data: companyUser,
    message: 'User added to company successfully'
  });
});

export const removeUserFromCompany = asyncHandler(async (req, res) => {
  const { companyId, userId } = req.params;
  
  const result = await CompanyService.removeUserFromCompany(userId, companyId);
  
  res.json({
    success: true,
    message: result.message
  });
});

export const updateUserCompanyRole = asyncHandler(async (req, res) => {
  const { companyId, userId } = req.params;
  const { role } = req.body;
  
  const companyUser = await CompanyService.updateUserRole(userId, companyId, role);
  
  res.json({
    success: true,
    data: companyUser,
    message: 'User role updated successfully'
  });
});