import { prisma } from '../config/prisma.js';
import { 
  handlePrismaError, 
  createError 
} from '../utils/dbHelpers.js';

// Admin operations
export const promoteUserToSuperAdmin = async (userId) => {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { 
        global_role: 'SUPER_ADMIN'
      }
    });
    
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    throw handlePrismaError(error);
  }
};

export const demoteSuperAdminToUser = async (userId) => {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { 
        global_role: 'USER'
      }
    });
    
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    throw handlePrismaError(error);
  }
};

export const getSystemStats = async () => {
  try {
    const [
      totalUsers,
      totalCompanies,
      totalProjects,
      totalBugs,
      superAdmins,
      activeCompanyUsers,
      openBugs,
      criticalBugs
    ] = await Promise.all([
      prisma.user.count(),
      prisma.company.count(),
      prisma.project.count(),
      prisma.bug.count(),
      prisma.user.count({ where: { global_role: 'SUPER_ADMIN' } }),
      prisma.companyUser.count(),
      prisma.bug.count({ where: { status: 'open' } }),
      prisma.bug.count({ where: { priority: 'critical' } })
    ]);
    
    return {
      users: {
        total: totalUsers,
        super_admins: superAdmins,
        regular_users: totalUsers - superAdmins
      },
      companies: {
        total: totalCompanies
      },
      projects: {
        total: totalProjects
      },
      bugs: {
        total: totalBugs,
        open: openBugs,
        critical: criticalBugs
      },
      company_memberships: {
        total: activeCompanyUsers
      }
    };
  } catch (error) {
    throw handlePrismaError(error);
  }
};

export const manageCompanyUsers = async (companyId, action, userId, role) => {
  try {
    switch (action) {
      case 'add':
        const newMembership = await prisma.companyUser.create({
          data: {
            user_id: userId,
            company_id: companyId,
            role: role || 'OTHERS'
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
        return newMembership;
        
      case 'remove':
        await prisma.companyUser.delete({
          where: {
            user_id_company_id: {
              user_id: userId,
              company_id: companyId
            }
          }
        });
        return { message: 'User removed from company successfully' };
        
      case 'update_role':
        const updatedMembership = await prisma.companyUser.update({
          where: {
            user_id_company_id: {
              user_id: userId,
              company_id: companyId
            }
          },
          data: { role: role },
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
        return updatedMembership;
        
      default:
        throw createError('Invalid action', 400);
    }
  } catch (error) {
    throw handlePrismaError(error);
  }
};

// Get all system users with their companies
export const getAllSystemUsers = async (page = 1, limit = 10, filters = {}) => {
  try {
    const skip = (page - 1) * limit;
    const where = {};
    
    if (filters.global_role) {
      where.global_role = filters.global_role;
    }
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          company_users: {
            include: {
              company: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              }
            }
          }
        },
        orderBy: { created_at: 'desc' }
      }),
      prisma.user.count({ where })
    ]);
    
    // Remove passwords from response
    const usersWithoutPasswords = users.map(user => {
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    return {
      users: usersWithoutPasswords,
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

// Get all companies with their stats
export const getAllCompaniesWithStats = async (page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    
    const [companies, total] = await Promise.all([
      prisma.company.findMany({
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
          projects: {
            include: {
              bugs: {
                select: {
                  id: true,
                  status: true,
                  priority: true
                }
              }
            }
          }
        },
        orderBy: { created_at: 'desc' }
      }),
      prisma.company.count()
    ]);
    
    // Add statistics to each company
    const companiesWithStats = companies.map(company => {
      const allBugs = company.projects.flatMap(p => p.bugs);
      
      return {
        ...company,
        stats: {
          users: company.company_users.length,
          projects: company.projects.length,
          bugs: {
            total: allBugs.length,
            open: allBugs.filter(b => b.status === 'open').length,
            critical: allBugs.filter(b => b.priority === 'critical').length
          }
        }
      };
    });
    
    return {
      companies: companiesWithStats,
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