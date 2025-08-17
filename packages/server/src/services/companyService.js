import { prisma } from "../config/prisma.js";
import {
  handlePrismaError,
  createError,
  validateCompanyData,
} from "../utils/dbHelpers.js";

// Company CRUD functions
export const createCompany = async (companyData, creatorId) => {
  try {
    validateCompanyData(companyData);

    // Create company and add creator as admin in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: companyData.name,
          slug:
            companyData.slug ||
            companyData.name.toLowerCase().replace(/\s+/g, "-"),
        },
      });

      // Add creator as admin if provided
      if (creatorId) {
        await tx.companyUser.create({
          data: {
            user_id: creatorId,
            company_id: company.id,
            role: "ADMIN",
          },
        });
      }

      return company;
    });

    return result;
  } catch (error) {
    throw handlePrismaError(error);
  }
};

export const getCompanyById = async (companyId) => {
  try {
    // Load only essential company data, not all users and projects
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        slug: true,
        created_at: true,
        // Get counts instead of full data
        _count: {
          select: {
            company_users: true,
            projects: true,
          },
        },
      },
    });

    if (!company) {
      throw createError("Company not found", 404);
    }

    return company;
  } catch (error) {
    throw handlePrismaError(error);
  }
};

export const updateCompany = async (companyId, updateData) => {
  try {
    const transformedData = {};

    if (updateData.name) transformedData.name = updateData.name;
    if (updateData.slug) transformedData.slug = updateData.slug;

    const company = await prisma.company.update({
      where: { id: companyId },
      data: transformedData,
    });

    return company;
  } catch (error) {
    throw handlePrismaError(error);
  }
};

export const deleteCompany = async (companyId) => {
  try {
    await prisma.company.delete({
      where: { id: companyId },
    });

    return { message: "Company deleted successfully" };
  } catch (error) {
    throw handlePrismaError(error);
  }
};

export const getAllCompanies = async (page = 1, limit = 10, filters = {}) => {
  try {
    const skip = (page - 1) * limit;
    const where = {};

    if (filters.name) {
      where.name = {
        contains: filters.name,
        mode: "insensitive",
      };
    }

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          created_at: true,
          // Get counts instead of loading all users and projects
          _count: {
            select: {
              company_users: true,
              projects: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      }),
      prisma.company.count({ where }),
    ]);

    return {
      companies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw handlePrismaError(error);
  }
};

export const searchCompanies = async (searchTerm, limit = 10) => {
  try {
    const companies = await prisma.company.findMany({
      where: {
        OR: [
          {
            name: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            slug: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        created_at: true,
      },
      take: limit,
      orderBy: { created_at: "desc" },
    });

    return companies;
  } catch (error) {
    throw handlePrismaError(error);
  }
};
