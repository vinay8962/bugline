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

// Get company members with their roles and details
export const getCompanyMembers = async (companyId) => {
  try {
    // Validate input
    if (!companyId) {
      throw createError("Company ID is required", 400);
    }

    const members = await prisma.companyUser.findMany({
      where: { company_id: companyId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            full_name: true,
            profile_picture: true,
            created_at: true,
            // Removed last_login_at as it doesn't exist in the schema
          },
        },
      },
      orderBy: { created_at: "asc" },
    });

    // Transform the data to a more convenient format
    const transformedMembers = members.map((member) => ({
      id: member.id,
      role: member.role,
      joined_at: member.created_at,
      user: member.user,
    }));

    return transformedMembers;
  } catch (error) {
    throw handlePrismaError(error);
  }
};

// Add user to company (for invite functionality)
export const addUserToCompany = async (companyId, userId, role = "OTHERS") => {
  try {
    // Check if user is already a member
    const existingMember = await prisma.companyUser.findUnique({
      where: {
        user_id_company_id: {
          user_id: userId,
          company_id: companyId,
        },
      },
    });

    if (existingMember) {
      throw createError("User is already a member of this company", 400);
    }

    const companyUser = await prisma.companyUser.create({
      data: {
        user_id: userId,
        company_id: companyId,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            full_name: true,
            profile_picture: true,
          },
        },
      },
    });

    return {
      id: companyUser.id,
      role: companyUser.role,
      joined_at: companyUser.created_at,
      user: companyUser.user,
    };
  } catch (error) {
    throw handlePrismaError(error);
  }
};

// Remove user from company
export const removeUserFromCompany = async (companyId, userId) => {
  try {
    await prisma.companyUser.delete({
      where: {
        user_id_company_id: {
          user_id: userId,
          company_id: companyId,
        },
      },
    });

    return { message: "User removed from company successfully" };
  } catch (error) {
    throw handlePrismaError(error);
  }
};

// Update user role in company
export const updateUserRole = async (userId, companyId, role) => {
  try {
    const companyUser = await prisma.companyUser.update({
      where: {
        user_id_company_id: {
          user_id: userId,
          company_id: companyId,
        },
      },
      data: {
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            full_name: true,
            profile_picture: true,
          },
        },
      },
    });

    return {
      id: companyUser.id,
      role: companyUser.role,
      joined_at: companyUser.created_at,
      user: companyUser.user,
    };
  } catch (error) {
    throw handlePrismaError(error);
  }
};

// Get company statistics
export const getCompanyStats = async (companyId) => {
  try {
    const [
      totalUsers,
      totalProjects,
      totalBugs,
      openBugs,
      inProgressBugs,
      resolvedBugs,
      closedBugs,
      criticalBugs,
      highBugs,
    ] = await Promise.all([
      // Total users
      prisma.companyUser.count({
        where: { company_id: companyId },
      }),
      // Total projects
      prisma.project.count({
        where: { company_id: companyId },
      }),
      // Total bugs
      prisma.bug.count({
        where: {
          project: { company_id: companyId },
        },
      }),
      // Open bugs
      prisma.bug.count({
        where: {
          project: { company_id: companyId },
          status: "open",
        },
      }),
      // In progress bugs
      prisma.bug.count({
        where: {
          project: { company_id: companyId },
          status: "in_progress",
        },
      }),
      // Resolved bugs
      prisma.bug.count({
        where: {
          project: { company_id: companyId },
          status: "resolved",
        },
      }),
      // Closed bugs
      prisma.bug.count({
        where: {
          project: { company_id: companyId },
          status: "closed",
        },
      }),
      // Critical bugs
      prisma.bug.count({
        where: {
          project: { company_id: companyId },
          priority: "critical",
        },
      }),
      // High priority bugs
      prisma.bug.count({
        where: {
          project: { company_id: companyId },
          priority: "high",
        },
      }),
    ]);

    return {
      totalUsers,
      totalProjects,
      totalBugs,
      openBugs,
      inProgressBugs,
      resolvedBugs,
      closedBugs,
      criticalBugs,
      highBugs,
      activeBugs: openBugs + inProgressBugs,
    };
  } catch (error) {
    throw handlePrismaError(error);
  }
};
