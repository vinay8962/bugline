import * as UserService from "../services/userService.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { sendSuccess, sendError } from "../utils/responseHelpers.js";
import { logInfo, logPerformance } from "../utils/logger.js";
import { createSecureAuthResponse } from "../utils/encryption.js";

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

  sendSuccess(
    res,
    result.users,
    "Users retrieved successfully",
    200,
    result.pagination
  );
});

// Get user by ID - Use encryption for sensitive user data
export const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await UserService.getUserById(userId);

  // Create secure encrypted response for user data
  const secureResponse = createSecureAuthResponse(user, null, null);

  sendSuccess(
    res,
    {
      encryptedUser: secureResponse.encryptedUser,
      iv: secureResponse.iv,
      tag: secureResponse.tag,
    },
    "User retrieved successfully"
  );
});

// Get current user (for authenticated user)
export const getCurrentUser = asyncHandler(async (req, res) => {
  const startTime = Date.now();

  logInfo("Get current user request", { userId: req.user.id });

  const user = await UserService.getUserById(req.user.id);

  const duration = Date.now() - startTime;
  logPerformance("Get current user", duration, { userId: user.id });

  // Create secure encrypted response (no token needed for current user)
  const secureResponse = createSecureAuthResponse(user, null, null);

  sendSuccess(
    res,
    {
      ...secureResponse,
      success: true,
    },
    "User data retrieved successfully"
  );
});

// Update user
export const updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const updateData = req.body;

  const user = await UserService.updateUser(userId, updateData);

  sendSuccess(res, user, "User updated successfully");
});

// Update current user
export const updateCurrentUser = asyncHandler(async (req, res) => {
  const updateData = req.body;

  const user = await UserService.updateUser(req.user.id, updateData);

  sendSuccess(res, user, "Profile updated successfully");
});

// Delete user
export const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const result = await UserService.deleteUser(userId);

  sendSuccess(res, null, result.message);
});

// Search users
export const searchUsers = asyncHandler(async (req, res) => {
  const { q: searchTerm, limit = 10 } = req.query;

  const users = await UserService.searchUsers(searchTerm, parseInt(limit));

  sendSuccess(res, users, "Users search completed successfully");
});

// Get user companies
export const getUserCompanies = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const companies = await UserService.getUserCompanies(userId);

  sendSuccess(res, companies, "User companies retrieved successfully");
});

// Get user by email
export const getUserByEmail = asyncHandler(async (req, res) => {
  const { email } = req.params;

  const user = await UserService.getUserByEmail(email);

  if (!user) {
    return sendError(res, "User not found", 404);
  }

  sendSuccess(res, user, "User retrieved successfully");
});

// Update user role (SUPER_ADMIN only)
export const updateUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { global_role } = req.body;

  const user = await UserService.updateUserRole(userId, global_role);

  sendSuccess(res, user, "User role updated successfully");
});

// Get current user stats
export const getCurrentUserStats = asyncHandler(async (req, res) => {
  // This would need to be implemented in the service
  sendSuccess(
    res,
    { message: "User stats not implemented yet" },
    "User stats functionality is planned for future release"
  );
});

// Get user stats
export const getUserStats = asyncHandler(async (req, res) => {
  // This would need to be implemented in the service
  sendSuccess(
    res,
    { message: "User stats not implemented yet" },
    "User stats functionality is planned for future release"
  );
});
