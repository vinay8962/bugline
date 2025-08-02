import { prisma } from '../config/prisma.js';
import { 
  handlePrismaError, 
  createError,
  validateCompanyData 
} from '../utils/dbHelpers.js';

// Company CRUD functions
export const createCompany = async (companyData, creatorId) => {
  try {
    validateCompanyData(companyData);
    
    // Create company and add creator as admin in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: companyData.name,
          slug: companyData.slug || companyData.name.toLowerCase().replace(/\s+/g, '-')
        }
      });
      
      // Add creator as admin if provided
      if (creatorId) {
        await tx.companyUser.create({
          data: {
            user_id: creatorId,
            company_id: company.id,
            role: 'ADMIN'
          }
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
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        company_users: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                full_name: true,
                global_role: true
              }
            }
          }
        },
        projects: true
      }
    });
    
    if (!company) {
      throw createError('Company not found', 404);
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
      data: transformedData
    });
    
    return company;
  } catch (error) {
    throw handlePrismaError(error);
  }
};

export const deleteCompany = async (companyId) => {
  try {
    await prisma.company.delete({
      where: { id: companyId }
    });
    
    return { message: 'Company deleted successfully' };
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
        mode: 'insensitive'
      };
    }
    
    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: limit,
        include: {
          company_users: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  full_name: true
                }
              }
            }
          },
          projects: true
        },
        orderBy: { created_at: 'desc' }
      }),
      prisma.company.count({ where })
    ]);
    
    return {
      companies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
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
              mode: 'insensitive'
            }
          },
          {
            slug: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          }
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        created_at: true
      },
      take: limit,
      orderBy: { created_at: 'desc' }
    });
    
    return companies;
  } catch (error) {
    throw handlePrismaError(error);
  }
};

// Company Members
export const getCompanyMembers = async (companyId) => {
  try {
    const companyUsers = await prisma.companyUser.findMany({
      where: { 
        company_id: companyId
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            full_name: true,
            global_role: true,
            created_at: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    
    return companyUsers.map(cu => ({
      id: cu.id,
      role: cu.role,
      joined_at: cu.created_at,
      user: cu.user
    }));
  } catch (error) {
    throw handlePrismaError(error);
  }
};

// Add user to company
export const addUserToCompany = async (userId, companyId, role = 'OTHERS') => {
  try {
    const companyUser = await prisma.companyUser.create({
      data: {
        user_id: userId,
        company_id: companyId,
        role: role
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            full_name: true
          }
        },
        company: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });
    
    return companyUser;
  } catch (error) {
    throw handlePrismaError(error);
  }
};

// Remove user from company
export const removeUserFromCompany = async (userId, companyId) => {
  try {
    await prisma.companyUser.delete({
      where: {
        user_id_company_id: {
          user_id: userId,
          company_id: companyId
        }
      }
    });
    
    return { message: 'User removed from company successfully' };
  } catch (error) {
    throw handlePrismaError(error);
  }
};

// Update user role in company
export const updateUserRole = async (userId, companyId, newRole) => {
  try {
    const companyUser = await prisma.companyUser.update({
      where: {
        user_id_company_id: {
          user_id: userId,
          company_id: companyId
        }
      },
      data: {
        role: newRole
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            full_name: true
          }
        }
      }
    });
    
    return companyUser;
  } catch (error) {
    throw handlePrismaError(error);
  }
};