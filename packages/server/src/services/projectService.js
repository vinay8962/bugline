import { prisma } from "../config/prisma.js";
import { handlePrismaError, createError } from "../utils/dbHelpers.js";
import { generateSecureToken } from "../utils/encryption.js";

// Project CRUD functions
export const createProject = async (projectData, companyId, userId = null) => {
  try {
    const project = await prisma.project.create({
      data: {
        name: projectData.name,
        slug:
          projectData.slug ||
          projectData.name.toLowerCase().replace(/\s+/g, "-"),
        company_id: companyId,
        project_token: generateSecureToken(16), // Generate 32-char hex token
        allowed_domains: projectData.allowed_domains || [],
        widget_settings: projectData.widget_settings || {},
      },
    });

    // If userId is provided, ensure they are a member of the company
    if (userId) {
      // Check if user is already a member of the company
      const existingMembership = await prisma.companyUser.findUnique({
        where: {
          user_id_company_id: {
            user_id: userId,
            company_id: companyId,
          },
        },
      });

      // If not a member, add them as ADMIN (since they created a project)
      if (!existingMembership) {
        await prisma.companyUser.create({
          data: {
            user_id: userId,
            company_id: companyId,
            role: "ADMIN",
          },
        });
      }
    }

    return project;
  } catch (error) {
    throw handlePrismaError(error);
  }
};

export const getProjectById = async (projectId) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        bugs: {
          include: {
            assignee: {
              select: {
                id: true,
                email: true,
                full_name: true,
              },
            },
          },
          orderBy: { created_at: "desc" },
        },
      },
    });

    if (!project) {
      throw createError("Project not found", 404);
    }
    return project;
  } catch (error) {
    throw handlePrismaError(error);
  }
};

export const updateProject = async (projectId, updateData) => {
  try {
    const transformedData = {};

    if (updateData.name) transformedData.name = updateData.name;
    if (updateData.slug) transformedData.slug = updateData.slug;

    const project = await prisma.project.update({
      where: { id: projectId },
      data: transformedData,
    });

    return project;
  } catch (error) {
    throw handlePrismaError(error);
  }
};

export const deleteProject = async (projectId) => {
  try {
    await prisma.project.delete({
      where: { id: projectId },
    });

    return { message: "Project deleted successfully" };
  } catch (error) {
    throw handlePrismaError(error);
  }
};

export const getCompanyProjects = async (companyId, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    
    // Get projects without loading all bugs
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where: { company_id: companyId },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          created_at: true,
          company_id: true
        },
        orderBy: { created_at: "desc" },
      }),
      prisma.project.count({ where: { company_id: companyId } }),
    ]);
    
    // Get bug statistics for all projects in a single efficient query
    const projectIds = projects.map(p => p.id);
    
    if (projectIds.length === 0) {
      return {
        projects: [],
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    }
    
    // Use Prisma's groupBy to get aggregated bug statistics efficiently
    const [statusStats, priorityStats, totalCounts] = await Promise.all([
      // Group by project and status to get status counts
      prisma.bug.groupBy({
        by: ['project_id', 'status'],
        where: {
          project_id: { in: projectIds }
        },
        _count: {
          id: true
        }
      }),
      // Group by project and priority to get priority counts  
      prisma.bug.groupBy({
        by: ['project_id', 'priority'],
        where: {
          project_id: { in: projectIds }
        },
        _count: {
          id: true
        }
      }),
      // Get total bug count per project
      prisma.bug.groupBy({
        by: ['project_id'],
        where: {
          project_id: { in: projectIds }
        },
        _count: {
          id: true
        }
      })
    ]);
    
    // Create lookup maps for efficient data access
    const statusMap = new Map();
    const priorityMap = new Map();
    const totalMap = new Map();
    
    // Build status statistics map
    statusStats.forEach(stat => {
      if (!statusMap.has(stat.project_id)) {
        statusMap.set(stat.project_id, {});
      }
      statusMap.get(stat.project_id)[stat.status] = stat._count.id;
    });
    
    // Build priority statistics map
    priorityStats.forEach(stat => {
      if (!priorityMap.has(stat.project_id)) {
        priorityMap.set(stat.project_id, {});
      }
      priorityMap.get(stat.project_id)[stat.priority] = stat._count.id;
    });
    
    // Build total count map
    totalCounts.forEach(stat => {
      totalMap.set(stat.project_id, stat._count.id);
    });
    
    // Add bug statistics to each project efficiently
    const projectsWithStats = projects.map(project => {
      const projectStatusStats = statusMap.get(project.id) || {};
      const projectPriorityStats = priorityMap.get(project.id) || {};
      const totalBugs = totalMap.get(project.id) || 0;
      
      return {
        ...project,
        bug_stats: {
          total: totalBugs,
          open: projectStatusStats.open || 0,
          in_progress: projectStatusStats.in_progress || 0,
          resolved: projectStatusStats.resolved || 0,
          closed: projectStatusStats.closed || 0,
          critical: projectPriorityStats.critical || 0,
          high: projectPriorityStats.high || 0
        }
      };
    });
    
    return {
      projects: projectsWithStats,
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

export const searchProjects = async (companyId, searchTerm, limit = 10) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        company_id: companyId,
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

    return projects;
  } catch (error) {
    throw handlePrismaError(error);
  }
};
