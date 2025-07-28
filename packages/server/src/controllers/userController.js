import { UserService } from "../services/userService.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export class UserController {
  // Get all users with pagination and search
  static getUsers = asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 10,
      search = "",
      sort_by = "created_at",
      sort_order = "desc",
    } = req.query;

    const result = await UserService.getUsers(
      parseInt(page),
      parseInt(limit),
      search,
      sort_by,
      sort_order
    );

    res.status(200).json({
      success: true,
      data: result.users,
      pagination: result.pagination,
    });
  });

  // Get user by ID
  static getUserById = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const user = await UserService.getUserById(userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  });

  // Get current user profile
  static getCurrentUser = asyncHandler(async (req, res) => {
    const user = await UserService.getUserById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  });

  // Update current user profile
  static updateCurrentUser = asyncHandler(async (req, res) => {
    const updatedUser = await UserService.updateUser(req.user.id, req.body);

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: "Profile updated successfully",
    });
  });

  // Update user by ID (admin only)
  static updateUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const updatedUser = await UserService.updateUser(userId, req.body);

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: "User updated successfully",
    });
  });

  // Update user global role (super admin only)
  static updateUserRole = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { global_role } = req.body;

    const updatedUser = await UserService.updateUserRole(userId, global_role);

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: "User role updated successfully",
    });
  });

  // Delete user (admin only)
  static deleteUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    await UserService.deleteUser(userId);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  });

  // Get user's companies
  static getUserCompanies = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const companies = await UserService.getUserCompanies(userId);

    res.status(200).json({
      success: true,
      data: companies,
    });
  });

  // Get current user's companies
  static getCurrentUserCompanies = asyncHandler(async (req, res) => {
    const companies = await UserService.getUserCompanies(req.user.id);

    res.status(200).json({
      success: true,
      data: companies,
    });
  });

  // Search users
  static searchUsers = asyncHandler(async (req, res) => {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const users = await UserService.searchUsers(q, parseInt(limit));

    res.status(200).json({
      success: true,
      data: users,
    });
  });

  // Get user statistics
  static getUserStats = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const stats = await UserService.getUserStats(userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  });

  // Get current user statistics
  static getCurrentUserStats = asyncHandler(async (req, res) => {
    const stats = await UserService.getUserStats(req.user.id);

    res.status(200).json({
      success: true,
      data: stats,
    });
  });

  // Get user by email (admin only)
  static getUserByEmail = asyncHandler(async (req, res) => {
    const { email } = req.params;

    const user = await UserService.getUserByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  });
}
