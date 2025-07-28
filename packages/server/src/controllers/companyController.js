import { CompanyService } from "../services/companyService.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export class CompanyController {
  // Get all companies with pagination and search
  static getCompanies = asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 10,
      search = "",
      sort_by = "created_at",
      sort_order = "desc",
    } = req.query;

    const result = await CompanyService.getCompanies(
      parseInt(page),
      parseInt(limit),
      search,
      sort_by,
      sort_order
    );

    res.status(200).json({
      success: true,
      data: result.companies,
      pagination: result.pagination,
    });
  });

  // Get company by ID
  static getCompanyById = asyncHandler(async (req, res) => {
    const { companyId } = req.params;

    const company = await CompanyService.getCompanyById(companyId);

    res.status(200).json({
      success: true,
      data: company,
    });
  });

  // Create company
  static createCompany = asyncHandler(async (req, res) => {
    const company = await CompanyService.createCompany(req.body, req.user.id);

    res.status(201).json({
      success: true,
      data: company,
      message: "Company created successfully",
    });
  });

  // Update company
  static updateCompany = asyncHandler(async (req, res) => {
    const { companyId } = req.params;

    const updatedCompany = await CompanyService.updateCompany(
      companyId,
      req.body
    );

    res.status(200).json({
      success: true,
      data: updatedCompany,
      message: "Company updated successfully",
    });
  });

  // Delete company
  static deleteCompany = asyncHandler(async (req, res) => {
    const { companyId } = req.params;

    await CompanyService.deleteCompany(companyId);

    res.status(200).json({
      success: true,
      message: "Company deleted successfully",
    });
  });

  // Get company members
  static getCompanyMembers = asyncHandler(async (req, res) => {
    const { companyId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const result = await CompanyService.getCompanyMembers(
      companyId,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      data: result.members,
      pagination: result.pagination,
    });
  });

  // Get company statistics
  static getCompanyStats = asyncHandler(async (req, res) => {
    const { companyId } = req.params;

    const stats = await CompanyService.getCompanyStats(companyId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  });

  // Search companies
  static searchCompanies = asyncHandler(async (req, res) => {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const companies = await CompanyService.searchCompanies(q, parseInt(limit));

    res.status(200).json({
      success: true,
      data: companies,
    });
  });

  // Get user's companies
  static getUserCompanies = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const companies = await CompanyService.getUserCompanies(userId);

    res.status(200).json({
      success: true,
      data: companies,
    });
  });

  // Get current user's companies
  static getCurrentUserCompanies = asyncHandler(async (req, res) => {
    const companies = await CompanyService.getUserCompanies(req.user.id);

    res.status(200).json({
      success: true,
      data: companies,
    });
  });

  // Update company settings
  static updateCompanySettings = asyncHandler(async (req, res) => {
    const { companyId } = req.params;
    const { settings } = req.body;

    const updatedCompany = await CompanyService.updateCompanySettings(
      companyId,
      settings
    );

    res.status(200).json({
      success: true,
      data: updatedCompany,
      message: "Company settings updated successfully",
    });
  });

  // Get companies by industry
  static getCompaniesByIndustry = asyncHandler(async (req, res) => {
    const { industry } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const result = await CompanyService.getCompaniesByIndustry(
      industry,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      data: result.companies,
      pagination: result.pagination,
    });
  });

  // Get company by name
  static getCompanyByName = asyncHandler(async (req, res) => {
    const { name } = req.params;

    const company = await CompanyService.getCompanyByName(name);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    res.status(200).json({
      success: true,
      data: company,
    });
  });
}
