import { prisma } from '../config/prisma.js';
import { 
  handlePrismaError, 
  createError 
} from '../utils/dbHelpers.js';

// Bug CRUD functions
export const createBug = async (bugData) => {
  try {
    const bug = await prisma.bug.create({
      data: {
        project_id: bugData.project_id,
        title: bugData.title,
        description: bugData.description,
        status: bugData.status || 'open',
        priority: bugData.priority || 'medium',
        reporter_email: bugData.reporter_email || null,
        assigned_to: bugData.assigned_to || null
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            company: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        assignee: {
          select: {
            id: true,
            email: true,
            full_name: true
          }
        }
      }
    });
    
    return bug;
  } catch (error) {
    throw handlePrismaError(error);
  }
};

export const getBugById = async (bugId) => {
  try {
    const bug = await prisma.bug.findUnique({
      where: { id: bugId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
            company: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        },
        assignee: {
          select: {
            id: true,
            email: true,
            full_name: true,
            global_role: true
          }
        }
      }
    });
    
    if (!bug) {
      throw createError('Bug not found', 404);
    }
    
    return bug;
  } catch (error) {
    throw handlePrismaError(error);
  }
};

export const updateBug = async (bugId, updateData) => {
  try {
    const transformedData = {};
    
    if (updateData.title) transformedData.title = updateData.title;
    if (updateData.description) transformedData.description = updateData.description;
    if (updateData.status) transformedData.status = updateData.status;
    if (updateData.priority) transformedData.priority = updateData.priority;
    if (updateData.assigned_to !== undefined) transformedData.assigned_to = updateData.assigned_to;
    if (updateData.reporter_email) transformedData.reporter_email = updateData.reporter_email;
    
    const bug = await prisma.bug.update({
      where: { id: bugId },
      data: transformedData,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            company: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        assignee: {
          select: {
            id: true,
            email: true,
            full_name: true
          }
        }
      }
    });
    
    return bug;
  } catch (error) {
    throw handlePrismaError(error);
  }
};

export const deleteBug = async (bugId) => {
  try {
    await prisma.bug.delete({
      where: { id: bugId }
    });
    
    return { message: 'Bug deleted successfully' };
  } catch (error) {
    throw handlePrismaError(error);
  }
};

export const getProjectBugs = async (projectId, page = 1, limit = 10, filters = {}) => {
  try {
    const skip = (page - 1) * limit;
    const where = { project_id: projectId };
    
    // Add filters
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.assigned_to) where.assigned_to = filters.assigned_to;
    if (filters.reporter_email) {
      where.reporter_email = {
        contains: filters.reporter_email,
        mode: 'insensitive'
      };
    }
    
    const [bugs, total] = await Promise.all([
      prisma.bug.findMany({
        where,
        skip,
        take: limit,
        include: {
          assignee: {
            select: {
              id: true,
              email: true,
              full_name: true
            }
          }
        },
        orderBy: { created_at: 'desc' }
      }),
      prisma.bug.count({ where })
    ]);
    
    return {
      bugs,
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

export const getCompanyBugs = async (companyId, page = 1, limit = 10, filters = {}) => {
  try {
    const skip = (page - 1) * limit;
    const where = {
      project: {
        company_id: companyId
      }
    };
    
    // Add filters
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.assigned_to) where.assigned_to = filters.assigned_to;
    
    const [bugs, total] = await Promise.all([
      prisma.bug.findMany({
        where,
        skip,
        take: limit,
        include: {
          project: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          assignee: {
            select: {
              id: true,
              email: true,
              full_name: true
            }
          }
        },
        orderBy: { created_at: 'desc' }
      }),
      prisma.bug.count({ where })
    ]);
    
    return {
      bugs,
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

export const getUserAssignedBugs = async (userId, page = 1, limit = 10, filters = {}) => {
  try {
    const skip = (page - 1) * limit;
    const where = { assigned_to: userId };
    
    // Add filters
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    
    const [bugs, total] = await Promise.all([
      prisma.bug.findMany({
        where,
        skip,
        take: limit,
        include: {
          project: {
            select: {
              id: true,
              name: true,
              slug: true,
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
      prisma.bug.count({ where })
    ]);
    
    return {
      bugs,
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

export const searchBugs = async (projectId, searchTerm, limit = 10) => {
  try {
    const bugs = await prisma.bug.findMany({
      where: {
        project_id: projectId,
        OR: [
          {
            title: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          }
        ]
      },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        created_at: true
      },
      take: limit,
      orderBy: { created_at: 'desc' }
    });
    
    return bugs;
  } catch (error) {
    throw handlePrismaError(error);
  }
};

// Bug assignment
export const assignBug = async (bugId, userId) => {
  try {
    const bug = await prisma.bug.update({
      where: { id: bugId },
      data: { assigned_to: userId },
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            full_name: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    return bug;
  } catch (error) {
    throw handlePrismaError(error);
  }
};

export const unassignBug = async (bugId) => {
  try {
    const bug = await prisma.bug.update({
      where: { id: bugId },
      data: { assigned_to: null },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    return bug;
  } catch (error) {
    throw handlePrismaError(error);
  }
};