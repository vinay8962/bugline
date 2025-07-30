import * as UserService from '../services/userService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Get all users
export const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, global_role } = req.query;
  
  const filters = {};
  if (global_role) filters.global_role = global_role;
  
  const result = await UserService.getAllUsers(
    parseInt(page), 
    parseInt(limit), 
    filters
  );
  
  res.json({
    success: true,
    data: result.users,
    pagination: result.pagination
  });
});

// Get user by ID
export const getUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  const user = await UserService.getUserById(userId);
  
  res.json({
    success: true,
    data: user
  });
});

// Update user
export const updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const updateData = req.body;
  
  const user = await UserService.updateUser(userId, updateData);
  
  res.json({
    success: true,
    data: user,
    message: 'User updated successfully'
  });
});

// Delete user
export const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  const result = await UserService.deleteUser(userId);
  
  res.json({
    success: true,
    message: result.message
  });
});

// Search users
export const searchUsers = asyncHandler(async (req, res) => {
  const { q: searchTerm, limit = 10 } = req.query;
  
  const users = await UserService.searchUsers(searchTerm, parseInt(limit));
  
  res.json({
    success: true,
    data: users
  });
});

// Get user companies
export const getUserCompanies = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  const companies = await UserService.getUserCompanies(userId);
  
  res.json({
    success: true,
    data: companies
  });
});

// Update user password
export const updateUserPassword = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { newPassword } = req.body;
  
  const user = await UserService.updateUserPassword(userId, newPassword);
  
  res.json({
    success: true,
    data: user,
    message: 'Password updated successfully'
  });
});

// Update user role (SUPER_ADMIN only)
export const updateUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { global_role } = req.body;
  
  const user = await UserService.updateUserRole(userId, global_role);
  
  res.json({
    success: true,
    data: user,
    message: 'User role updated successfully'
  });
});