import { prisma } from '../config/prisma.js';
import { 
  handlePrismaError, 
  createError,
  validateUserData 
} from '../utils/dbHelpers.js';
import { 
  verifyUserPassword as verifyPassword,
  hashPassword 
} from '../utils/businessHelpers.js';

// Authentication functions
export const createUser = async (userData) => {
  try {
    validateUserData(userData);
    
    // Hash password before storing
    const hashedPassword = await hashPassword(userData.password);
    
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password_hash: hashedPassword,
        full_name: userData.full_name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
        global_role: userData.global_role || 'USER'
      }
    });
    
    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    throw handlePrismaError(error);
  }
};

export const getUserByEmail = async (email) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        company_users: {
          include: {
            company: true
          }
        }
      }
    });
    
    return user;
  } catch (error) {
    throw handlePrismaError(error);
  }
};

export const verifyUserPassword = async (email, password) => {
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      throw createError('User not found', 404);
    }
    
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      throw createError('Invalid password', 401);
    }
    
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    throw handlePrismaError(error);
  }
};

// User management functions
export const getUserById = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        company_users: {
          include: {
            company: true
          }
        }
      }
    });
    
    if (!user) {
      throw createError('User not found', 404);
    }
    
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    throw handlePrismaError(error);
  }
};

export const updateUser = async (userId, updateData) => {
  try {
    const transformedData = {};
    
    if (updateData.email) transformedData.email = updateData.email;
    if (updateData.full_name) transformedData.full_name = updateData.full_name;
    if (updateData.global_role) transformedData.global_role = updateData.global_role;
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: transformedData
    });
    
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    throw handlePrismaError(error);
  }
};

export const deleteUser = async (userId) => {
  try {
    await prisma.user.delete({
      where: { id: userId }
    });
    
    return { message: 'User deleted successfully' };
  } catch (error) {
    throw handlePrismaError(error);
  }
};

export const getAllUsers = async (page = 1, limit = 10, filters = {}) => {
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
              company: true
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

export const searchUsers = async (searchTerm, limit = 10) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            full_name: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          },
          {
            email: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          }
        ]
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        global_role: true,
        created_at: true
      },
      take: limit,
      orderBy: { created_at: 'desc' }
    });
    
    return users;
  } catch (error) {
    throw handlePrismaError(error);
  }
};

// Password management
export const updateUserPassword = async (userId, newPassword) => {
  try {
    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: { 
        password_hash: hashedPassword
      }
    });
    
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    throw handlePrismaError(error);
  }
};

// Role management
export const updateUserRole = async (userId, newRole) => {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { 
        global_role: newRole
      }
    });
    
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    throw handlePrismaError(error);
  }
};

// Get user companies
export const getUserCompanies = async (userId) => {
  try {
    const companyUsers = await prisma.companyUser.findMany({
      where: { 
        user_id: userId
      },
      include: {
        company: true
      }
    });
    
    return companyUsers.map(cu => ({
      ...cu.company,
      role: cu.role,
      joined_at: cu.created_at
    }));
  } catch (error) {
    throw handlePrismaError(error);
  }
};