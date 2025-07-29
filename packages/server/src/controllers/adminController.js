import { AdminService } from "../services/adminService.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export class AdminController {
  // Create user and assign to company
  static createUserForCompany = asyncHandler(async (req, res) => {
    const { companyId } = req.params;
    const userData = req.body;
    const createdBy = req.user.id;

    const result = await AdminService.createUserForCompany(
      companyId,
      userData,
      createdBy
    );

    res.status(201).json({
      success: true,
      data: result,
      message: result.isNewUser 
        ? "User created and invited to company successfully"
        : "Existing user invited to company successfully",
    });
  });

  // Bulk create users
  static bulkCreateUsers = asyncHandler(async (req, res) => {
    const { companyId } = req.params;
    const { users } = req.body;
    const createdBy = req.user.id;

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Users array is required and cannot be empty",
      });
    }

    const results = await AdminService.bulkCreateUsers(companyId, users, createdBy);

    const statusCode = results.errors.length === 0 ? 201 : 
                      results.success.length === 0 ? 400 : 207; // Multi-status

    res.status(statusCode).json({
      success: results.errors.length === 0,
      data: results,
      message: `Processed ${results.total} users. ${results.success.length} successful, ${results.errors.length} failed.`,
    });
  });

  // Update user role in company
  static updateUserRole = asyncHandler(async (req, res) => {
    const { companyId, userId } = req.params;
    const { role } = req.body;
    const updatedBy = req.user.id;

    const result = await AdminService.updateUserRole(
      companyId,
      userId,
      role,
      updatedBy
    );

    res.status(200).json({
      success: true,
      data: result,
      message: "User role updated successfully",
    });
  });

  // Get company team members
  static getCompanyTeamMembers = asyncHandler(async (req, res) => {
    const { companyId } = req.params;
    const {
      page = 1,
      limit = 10,
      role,
      status,
      search,
    } = req.query;

    const result = await AdminService.getCompanyTeamMembers(companyId, {
      page: parseInt(page),
      limit: parseInt(limit),
      role,
      status,
      search,
    });

    res.status(200).json({
      success: true,
      data: result.memberships,
      pagination: result.pagination,
    });
  });

  // Remove user from company
  static removeUserFromCompany = asyncHandler(async (req, res) => {
    const { companyId, userId } = req.params;
    const removedBy = req.user.id;

    const result = await AdminService.removeUserFromCompany(
      companyId,
      userId,
      removedBy
    );

    res.status(200).json({
      success: true,
      message: result.message,
    });
  });

  // Suspend user
  static suspendUser = asyncHandler(async (req, res) => {
    const { companyId, userId } = req.params;
    const { reason } = req.body;
    const suspendedBy = req.user.id;

    const result = await AdminService.suspendUser(
      companyId,
      userId,
      suspendedBy,
      reason
    );

    res.status(200).json({
      success: true,
      data: result,
      message: "User suspended successfully",
    });
  });

  // Reactivate user
  static reactivateUser = asyncHandler(async (req, res) => {
    const { companyId, userId } = req.params;
    const reactivatedBy = req.user.id;

    const result = await AdminService.reactivateUser(
      companyId,
      userId,
      reactivatedBy
    );

    res.status(200).json({
      success: true,
      data: result,
      message: "User reactivated successfully",
    });
  });

  // Resend email verification
  static resendEmailVerification = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { companyId } = req.body;

    const result = await AdminService.resendEmailVerification(userId, companyId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  });

  // Verify email (public endpoint)
  static verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    const result = await AdminService.verifyEmail(token);

    res.status(200).json({
      success: true,
      data: result,
      message: "Email verified successfully",
    });
  });

  // Get email verification status
  static getEmailVerificationStatus = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    // This would typically check the user's email verification status
    // For now, we'll use the existing user service
    const { UserService } = await import("../services/userService.js");
    const user = await UserService.getUserById(userId);

    res.status(200).json({
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        emailVerified: user.email_verified,
        emailVerifiedAt: user.email_verified_at,
      },
    });
  });
}