import * as ProjectService from '../services/projectService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Create project
export const createProject = asyncHandler(async (req, res) => {
  const { companyId } = req.params;
  const projectData = req.body;
  
  const project = await ProjectService.createProject(projectData, companyId);
  
  res.status(201).json({
    success: true,
    data: project,
    message: 'Project created successfully'
  });
});

// Get project by ID
export const getProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  
  const project = await ProjectService.getProjectById(projectId);
  
  res.json({
    success: true,
    data: project
  });
});

// Update project
export const updateProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const updateData = req.body;
  
  const project = await ProjectService.updateProject(projectId, updateData);
  
  res.json({
    success: true,
    data: project,
    message: 'Project updated successfully'
  });
});

// Delete project
export const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  
  const result = await ProjectService.deleteProject(projectId);
  
  res.json({
    success: true,
    message: result.message
  });
});

// Get company projects
export const getCompanyProjects = asyncHandler(async (req, res) => {
  const { companyId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  
  const result = await ProjectService.getCompanyProjects(
    companyId, 
    parseInt(page), 
    parseInt(limit)
  );
  
  res.json({
    success: true,
    data: result.projects,
    pagination: result.pagination
  });
});

// Search projects
export const searchProjects = asyncHandler(async (req, res) => {
  const { companyId } = req.params;
  const { q: searchTerm, limit = 10 } = req.query;
  
  const projects = await ProjectService.searchProjects(
    companyId,
    searchTerm,
    parseInt(limit)
  );
  
  res.json({
    success: true,
    data: projects
  });
});