import { prisma } from '../config/prisma.js';
import { createError } from './dbHelpers.js';
import bcrypt from 'bcrypt';

// Role management helpers
export const canUserAccessCompany = async (userId, companyId, requiredRole) => {
  try {
    const membership = await prisma.companyUser.findFirst({
      where: { 
        user_id: userId, 
        company_id: companyId 
      },
      select: {
        role: true
      }
    });
    
    if (!membership) {
      return false;
    }
    
    return hasRequiredRole(membership.role, requiredRole);
  } catch (error) {
    return false;
  }
};

export const getUserEffectiveRole = async (userId, companyId) => {
  try {
    const membership = await prisma.companyUser.findFirst({
      where: { 
        user_id: userId, 
        company_id: companyId 
      },
      select: {
        role: true
      }
    });
    
    if (!membership) {
      return null;
    }
    
    return membership.role;
  } catch (error) {
    return null;
  }
};

export const hasRequiredRole = (userRole, requiredRole) => {
  // For UserRole (global roles)
  const globalRoleHierarchy = {
    SUPER_ADMIN: 3,
    ADMIN: 2,
    USER: 1
  };
  
  // For CompanyRole (company-specific roles)
  const companyRoleHierarchy = {
    ADMIN: 3,
    DEVELOPER: 2,
    QA: 1,
    OTHERS: 0
  };
  
  // Check if roles are global or company roles
  if (globalRoleHierarchy[userRole] !== undefined && globalRoleHierarchy[requiredRole] !== undefined) {
    return globalRoleHierarchy[userRole] >= globalRoleHierarchy[requiredRole];
  }
  
  if (companyRoleHierarchy[userRole] !== undefined && companyRoleHierarchy[requiredRole] !== undefined) {
    return companyRoleHierarchy[userRole] >= companyRoleHierarchy[requiredRole];
  }
  
  return false;
};

// Statistics helpers
export const calculateUserStats = async (userId) => {
  try {
    const [companyCount, adminCount, bugCount, assignedBugCount] = await Promise.all([
      prisma.companyUser.count({
        where: { 
          user_id: userId
        }
      }),
      prisma.companyUser.count({
        where: { 
          user_id: userId, 
          role: 'ADMIN'
        }
      }),
      prisma.bug.count({
        where: { 
          assigned_to: userId 
        }
      }),
      prisma.bug.count({
        where: { 
          assigned_to: userId 
        }
      })
    ]);
    
    return {
      totalCompanies: companyCount,
      adminCompanies: adminCount,
      memberCompanies: companyCount - adminCount,
      reportedBugs: bugCount,
      assignedBugs: assignedBugCount
    };
  } catch (error) {
    throw createError('Failed to calculate user statistics', 500);
  }
};

export const calculateCompanyStats = async (companyId) => {
  try {
    const [userCount, projectCount, bugCount, activeBugCount] = await Promise.all([
      prisma.companyUser.count({
        where: { 
          company_id: companyId
        }
      }),
      prisma.project.count({
        where: { 
          company_id: companyId
        }
      }),
      prisma.bug.count({
        where: { 
          project: { 
            company_id: companyId 
          } 
        }
      }),
      prisma.bug.count({
        where: { 
          project: { 
            company_id: companyId 
          },
          status: {
            in: ['open', 'in_progress']
          }
        }
      })
    ]);
    
    return {
      totalUsers: userCount,
      totalProjects: projectCount,
      totalBugs: bugCount,
      activeBugs: activeBugCount,
      resolvedBugs: bugCount - activeBugCount
    };
  } catch (error) {
    throw createError('Failed to calculate company statistics', 500);
  }
};

// Validation helpers
export const validateRoleTransition = (currentRole, newRole) => {
  const validTransitions = {
    ADMIN: ['DEVELOPER', 'QA', 'OTHERS'],
    DEVELOPER: ['QA', 'OTHERS'],
    QA: ['OTHERS'],
    OTHERS: ['QA', 'DEVELOPER', 'ADMIN']
  };
  
  if (!validTransitions[currentRole]?.includes(newRole)) {
    throw createError(`Invalid role transition from ${currentRole} to ${newRole}`, 400);
  }
  
  return true;
};

export const validateCompanyAccess = (userRole, requiredRole) => {
  if (!hasRequiredRole(userRole, requiredRole)) {
    throw createError('Insufficient permissions', 403);
  }
  
  return true;
};

// Password helpers
export const hashPassword = async (password) => {
  try {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    throw createError('Failed to hash password', 500);
  }
};

export const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw createError('Failed to compare password', 500);
  }
};

// User verification helpers
export const verifyUserPassword = async (email, password) => {
  try {
    const user = await prisma.user.findFirst({
      where: { email }
    });
    
    if (!user || !user.password_hash) {
      return null;
    }
    
    const isValid = await comparePassword(password, user.password_hash);
    
    if (!isValid) {
      return null;
    }
    
    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    return null;
  }
};

// Company access helpers
export const isUserInCompany = async (userId, companyId) => {
  try {
    const membership = await prisma.companyUser.findFirst({
      where: { 
        user_id: userId, 
        company_id: companyId 
      }
    });
    
    return !!membership;
  } catch (error) {
    return false;
  }
};

export const getCompanyAdmins = async (companyId) => {
  try {
    return await prisma.companyUser.findMany({
      where: { 
        company_id: companyId, 
        role: 'ADMIN'
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
  } catch (error) {
    throw createError('Failed to get company admins', 500);
  }
};

export const getCompanyDevelopers = async (companyId) => {
  try {
    return await prisma.companyUser.findMany({
      where: { 
        company_id: companyId, 
        role: 'DEVELOPER'
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
  } catch (error) {
    throw createError('Failed to get company developers', 500);
  }
};

export const getCompanyQA = async (companyId) => {
  try {
    return await prisma.companyUser.findMany({
      where: { 
        company_id: companyId, 
        role: 'QA'
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
  } catch (error) {
    throw createError('Failed to get company QA users', 500);
  }
}; 