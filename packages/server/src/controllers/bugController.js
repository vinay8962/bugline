import * as BugService from '../services/bugService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Create bug (for widget and internal use)
export const createBug = asyncHandler(async (req, res) => {
  const bugData = req.body;
  
  const bug = await BugService.createBug(bugData);
  
  res.status(201).json({
    success: true,
    data: bug,
    message: 'Bug report created successfully'
  });
});

// Get bug by ID
export const getBug = asyncHandler(async (req, res) => {
  const { bugId } = req.params;
  
  const bug = await BugService.getBugById(bugId);
  
  res.json({
    success: true,
    data: bug
  });
});

// Update bug
export const updateBug = asyncHandler(async (req, res) => {
  const { bugId } = req.params;
  const updateData = req.body;
  
  const bug = await BugService.updateBug(bugId, updateData);
  
  res.json({
    success: true,
    data: bug,
    message: 'Bug updated successfully'
  });
});

// Delete bug
export const deleteBug = asyncHandler(async (req, res) => {
  const { bugId } = req.params;
  
  const result = await BugService.deleteBug(bugId);
  
  res.json({
    success: true,
    message: result.message
  });
});

// Get project bugs
export const getProjectBugs = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { 
    page = 1, 
    limit = 10, 
    status, 
    priority, 
    assigned_to, 
    reporter_email 
  } = req.query;
  
  const filters = {};
  if (status) filters.status = status;
  if (priority) filters.priority = priority;
  if (assigned_to) filters.assigned_to = assigned_to;
  if (reporter_email) filters.reporter_email = reporter_email;
  
  const result = await BugService.getProjectBugs(
    projectId,
    parseInt(page),
    parseInt(limit),
    filters
  );
  
  res.json({
    success: true,
    data: result.bugs,
    pagination: result.pagination
  });
});

// Get company bugs
export const getCompanyBugs = asyncHandler(async (req, res) => {
  const { companyId } = req.params;
  const { 
    page = 1, 
    limit = 10, 
    status, 
    priority, 
    assigned_to 
  } = req.query;
  
  const filters = {};
  if (status) filters.status = status;
  if (priority) filters.priority = priority;
  if (assigned_to) filters.assigned_to = assigned_to;
  
  const result = await BugService.getCompanyBugs(
    companyId,
    parseInt(page),
    parseInt(limit),
    filters
  );
  
  res.json({
    success: true,
    data: result.bugs,
    pagination: result.pagination
  });
});

// Get user assigned bugs
export const getUserAssignedBugs = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { 
    page = 1, 
    limit = 10, 
    status, 
    priority 
  } = req.query;
  
  const filters = {};
  if (status) filters.status = status;
  if (priority) filters.priority = priority;
  
  const result = await BugService.getUserAssignedBugs(
    userId,
    parseInt(page),
    parseInt(limit),
    filters
  );
  
  res.json({
    success: true,
    data: result.bugs,
    pagination: result.pagination
  });
});

// Search bugs
export const searchBugs = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { q: searchTerm, limit = 10 } = req.query;
  
  const bugs = await BugService.searchBugs(
    projectId,
    searchTerm,
    parseInt(limit)
  );
  
  res.json({
    success: true,
    data: bugs
  });
});

// Assign bug
export const assignBug = asyncHandler(async (req, res) => {
  const { bugId } = req.params;
  const { userId } = req.body;
  
  const bug = await BugService.assignBug(bugId, userId);
  
  res.json({
    success: true,
    data: bug,
    message: 'Bug assigned successfully'
  });
});

// Unassign bug
export const unassignBug = asyncHandler(async (req, res) => {
  const { bugId } = req.params;
  
  const bug = await BugService.unassignBug(bugId);
  
  res.json({
    success: true,
    data: bug,
    message: 'Bug unassigned successfully'
  });
});