import { prisma } from '../config/prisma.js';

// Pagination helpers
export const createPagination = (page = 1, limit = 10, total = 0) => {
  const totalPages = Math.ceil(total / limit);
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
};

export const applyPagination = (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const take = parseInt(limit);
  return { skip, take };
};

// Filtering helpers
export const createFilters = (filters = {}) => {
  const where = {};
  
  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
  }
  
  if (filters.role) {
    where.role = filters.role;
  }
  
  if (filters.isVerified !== undefined) {
    where.isVerified = filters.isVerified;
  }
  
  return where;
};

export const createSearchFilter = (searchTerm, fields = []) => {
  if (!searchTerm) return {};
  
  const searchConditions = fields.map(field => ({
    [field]: {
      contains: searchTerm,
      mode: 'insensitive'
    }
  }));
  
  return {
    OR: searchConditions
  };
};

// Error handling
export const handlePrismaError = (error) => {
  if (error.code === 'P2002') {
    return new Error('Record already exists');
  }
  if (error.code === 'P2025') {
    return new Error('Record not found');
  }
  if (error.code === 'P2003') {
    return new Error('Foreign key constraint failed');
  }
  
  return error;
};

export const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Validation helpers
export const validateUserData = (userData) => {
  const errors = [];
  
  if (!userData.email) {
    errors.push('Email is required');
  }
  
  if (!userData.password) {
    errors.push('Password is required');
  }
  
  // Check for either full_name OR firstName/lastName combination
  if (!userData.full_name && (!userData.firstName || !userData.lastName)) {
    errors.push('Full name is required');
  }
  
  if (errors.length > 0) {
    throw createError(errors.join(', '), 400);
  }
  
  return true;
};

export const validateCompanyData = (companyData) => {
  const errors = [];
  
  if (!companyData.name) {
    errors.push('Company name is required');
  }
  
  if (errors.length > 0) {
    throw createError(errors.join(', '), 400);
  }
  
  return true;
};

// Database connection test
export const testDatabaseConnection = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { success: true, message: 'Database connection successful' };
  } catch (error) {
    throw new Error(`Database connection failed: ${error.message}`);
  }
}; 