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
        assigned_to: bugData.assigned_to || null,
        error_details: bugData.error_details || null,
        environment: bugData.environment || null,
        source: bugData.source || 'manual'
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
    if (updateData.error_details !== undefined) transformedData.error_details = updateData.error_details;
    if (updateData.environment !== undefined) transformedData.environment = updateData.environment;
    if (updateData.source) transformedData.source = updateData.source;
    
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

// Widget-specific functions
export const getProjectBugStats = async (projectId, options = {}) => {
  try {
    const { source, period = '7d' } = options;
    
    // Calculate date range based on period
    const now = new Date();
    const periodMap = {
      '24h': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90
    };
    
    const daysBack = periodMap[period] || 7;
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
    
    const where = {
      project_id: projectId,
      created_at: {
        gte: startDate
      }
    };
    
    // Filter by source if specified (for widget stats)
    if (source) {
      where.source = source;
    }
    
    // Get basic counts
    const [totalBugs, bugsByStatus, bugsByPriority, bugsBySource] = await Promise.all([
      // Total bugs in period
      prisma.bug.count({ where }),
      
      // Bugs by status
      prisma.bug.groupBy({
        by: ['status'],
        where,
        _count: true
      }),
      
      // Bugs by priority
      prisma.bug.groupBy({
        by: ['priority'],
        where,
        _count: true
      }),
      
      // Bugs by source (widget vs manual)
      prisma.bug.groupBy({
        by: ['source'],
        where,
        _count: true
      })
    ]);
    
    // Get daily trend data
    const dailyTrends = await prisma.bug.groupBy({
      by: ['created_at'],
      where,
      _count: true,
      orderBy: {
        created_at: 'asc'
      }
    });
    
    // Process daily trends into date buckets
    const trendMap = {};
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      const dateKey = date.toISOString().split('T')[0];
      trendMap[dateKey] = 0;
    }
    
    dailyTrends.forEach(trend => {
      const dateKey = trend.created_at.toISOString().split('T')[0];
      if (trendMap.hasOwnProperty(dateKey)) {
        trendMap[dateKey] = trend._count;
      }
    });
    
    // Format response
    const stats = {
      period,
      total: totalBugs,
      byStatus: bugsByStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {}),
      byPriority: bugsByPriority.reduce((acc, item) => {
        acc[item.priority] = item._count;
        return acc;
      }, {}),
      bySource: bugsBySource.reduce((acc, item) => {
        acc[item.source] = item._count;
        return acc;
      }, {}),
      trends: Object.entries(trendMap).map(([date, count]) => ({
        date,
        count
      }))
    };
    
    return stats;
  } catch (error) {
    throw handlePrismaError(error);
  }
};