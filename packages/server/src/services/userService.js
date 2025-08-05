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
import { 
  logInfo, 
  logError, 
  logDebug,
  logDatabase, 
  logPerformance,
  logUserAction 
} from '../utils/logger.js';

// Authentication functions
export const createUser = async (userData) => {
  const startTime = Date.now();
  
  try {
    logInfo("Creating new user", { email: userData.email, role: userData.global_role });
    
    validateUserData(userData);
    
    // Hash password before storing
    const hashedPassword = await hashPassword(userData.password);
    
    // Determine email verification status based on role
    const globalRole = userData.global_role || 'USER';
    const emailVerified = globalRole === 'SUPER_ADMIN' || globalRole === 'ADMIN' ? true : false;
    
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password_hash: hashedPassword,
        full_name: userData.full_name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
        global_role: globalRole,
        email_verified: emailVerified
      }
    });
    
    const duration = Date.now() - startTime;
    logPerformance("User creation", duration, { userId: user.id, email: user.email });
    logUserAction(user.id, "user_created", { email: user.email, role: globalRole });
    
    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    const duration = Date.now() - startTime;
    logError("User creation failed", { error: error.message, email: userData.email, duration });
    throw handlePrismaError(error);
  }
};

export const getUserByEmail = async (email) => {
  const startTime = Date.now();
  
  try {
    logInfo("Fetching user by email", { email });
    
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        company_users: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                slug: true,
                created_at: true
              }
            }
          }
        }
      }
    });
    
    const duration = Date.now() - startTime;
    logPerformance("Get user by email", duration, { email, found: !!user });
    
    return user;
  } catch (error) {
    const duration = Date.now() - startTime;
    logError("Get user by email failed", { error: error.message, email, duration });
    throw handlePrismaError(error);
  }
};

export const verifyUserPassword = async (email, password) => {
  const startTime = Date.now();
  
  try {
    logInfo("Verifying user password", { email });
    
    const user = await getUserByEmail(email);
    if (!user) {
      logError("Password verification failed - user not found", { email });
      throw createError('User not found', 404);
    }
    
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      logError("Password verification failed - invalid password", { email });
      throw createError('Invalid password', 401);
    }
    
    const duration = Date.now() - startTime;
    logPerformance("Password verification", duration, { email, success: true });
    logUserAction(user.id, "password_verified", { email });
    
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    const duration = Date.now() - startTime;
    logError("Password verification failed", { error: error.message, email, duration });
    throw handlePrismaError(error);
  }
};

// User management functions
export const getUserById = async (userId) => {
  const startTime = Date.now();
  
  try {
    logInfo("Fetching user by ID", { userId });
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        company_users: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                slug: true,
                created_at: true
              }
            }
          }
        }
      }
    });
    
    if (!user) {
      logError("User not found by ID", { userId });
      throw createError('User not found', 404);
    }
    
    const duration = Date.now() - startTime;
    logPerformance("Get user by ID", duration, { userId, found: true });
    
    const { password_hash, company_users, ...userWithoutPassword } = user;
    
    // Transform company_users to a cleaner companies array
    const companies = company_users.map(cu => ({
      id: cu.company.id,
      name: cu.company.name,
      slug: cu.company.slug,
      created_at: cu.company.created_at,
      role: cu.role,
      joined_at: cu.created_at
    }));
    
    return {
      ...userWithoutPassword,
      companies
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logError("Get user by ID failed", { error: error.message, userId, duration });
    throw handlePrismaError(error);
  }
};

export const updateUser = async (userId, updateData) => {
  const startTime = Date.now();
  
  try {
    logInfo("Updating user", { userId, fields: Object.keys(updateData) });
    
    // Validate allowed fields for profile updates
    const allowedFields = [
      'email', 'full_name', 'phone', 'bio', 'location', 
      'timezone', 'profile_picture', 'global_role'
    ];
    
    const transformedData = {};
    
    // Only allow updates to allowed fields
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        transformedData[key] = value;
      }
    }
    
    // Validate email format if provided
    if (transformedData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(transformedData.email)) {
        throw createError('Invalid email format', 400);
      }
    }
    
    // Validate timezone if provided
    if (transformedData.timezone) {
      const validTimezones = [
        'America/Los_Angeles', 'America/Denver', 'America/Chicago', 
        'America/New_York', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo'
      ];
      if (!validTimezones.includes(transformedData.timezone)) {
        throw createError('Invalid timezone', 400);
      }
    }
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: transformedData,
      include: {
        company_users: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                slug: true,
                created_at: true
              }
            }
          }
        }
      }
    });
    
    const duration = Date.now() - startTime;
    logPerformance("User update", duration, { userId });
    logUserAction(userId, "profile_updated", { updatedFields: Object.keys(transformedData) });
    
    const { password_hash, company_users, ...userWithoutPassword } = user;
    
    // Transform company_users to a cleaner companies array
    const companies = company_users.map(cu => ({
      id: cu.company.id,
      name: cu.company.name,
      slug: cu.company.slug,
      created_at: cu.company.created_at,
      role: cu.role,
      joined_at: cu.created_at
    }));
    
    return {
      ...userWithoutPassword,
      companies
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logError("User update failed", { error: error.message, userId, duration });
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
              company: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  created_at: true
                }
              }
            }
          }
        },
        orderBy: { created_at: 'desc' }
      }),
      prisma.user.count({ where })
    ]);
    
    // Remove passwords and transform company data
    const usersWithoutPasswords = users.map(user => {
      const { password_hash, company_users, ...userWithoutPassword } = user;
      
      // Transform company_users to a cleaner companies array
      const companies = company_users.map(cu => ({
        id: cu.company.id,
        name: cu.company.name,
        slug: cu.company.slug,
        created_at: cu.company.created_at,
        role: cu.role,
        joined_at: cu.created_at
      }));
      
      return {
        ...userWithoutPassword,
        companies
      };
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

// Email verification
export const verifyUserEmail = async (userId) => {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { 
        email_verified: true
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