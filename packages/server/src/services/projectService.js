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

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where: { company_id: companyId },
        skip,
        take: limit,
        include: {
          bugs: {
            select: {
              id: true,
              status: true,
              priority: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      }),
      prisma.project.count({ where: { company_id: companyId } }),
    ]);

    // Add bug statistics to each project
    const projectsWithStats = projects.map((project) => ({
      ...project,
      bug_stats: {
        total: project.bugs.length,
        open: project.bugs.filter((b) => b.status === "open").length,
        in_progress: project.bugs.filter((b) => b.status === "in_progress")
          .length,
        resolved: project.bugs.filter((b) => b.status === "resolved").length,
        closed: project.bugs.filter((b) => b.status === "closed").length,
        critical: project.bugs.filter((b) => b.priority === "critical").length,
        high: project.bugs.filter((b) => b.priority === "high").length,
      },
    }));

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
