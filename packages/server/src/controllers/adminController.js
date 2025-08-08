import * as AdminService from "../services/adminService.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { sendSuccess, sendError } from "../utils/responseHelpers.js";

// Create user and assign to company
export const createUserForCompany = asyncHandler(async (req, res) => {
  const { companyId } = req.params;
  const userData = req.body;
  const createdBy = req.user.id;

  const result = await AdminService.createUserForCompany(
    companyId,
    userData,
    createdBy
  );

  const message = result.isNewUser
    ? "User created and invited to company successfully"
    : "Existing user invited to company successfully";

  sendSuccess(res, result, message, 201);
});

// Bulk create users
export const bulkCreateUsers = asyncHandler(async (req, res) => {
  const { companyId } = req.params;
  const { users } = req.body;
  const createdBy = req.user.id;

  if (!Array.isArray(users) || users.length === 0) {
    return sendError(res, "Users array is required and cannot be empty", 400);
  }

  const results = await AdminService.bulkCreateUsers(
    companyId,
    users,
    createdBy
  );

  const statusCode =
    results.errors.length === 0
      ? 201
      : results.success.length === 0
      ? 400
      : 207; // Multi-status

  const message = `Processed ${results.total} users. ${results.success.length} successful, ${results.errors.length} failed.`;

  sendSuccess(res, results, message, statusCode);
});

// Update user role in company
export const updateUserRole = asyncHandler(async (req, res) => {
  const { companyId, userId } = req.params;
  const { role } = req.body;
  const updatedBy = req.user.id;

  const result = await AdminService.updateUserRole(
    companyId,
    userId,
    role,
    updatedBy
  );

  sendSuccess(res, result, "User role updated successfully");
});

// Get company team members
export const getCompanyTeamMembers = asyncHandler(async (req, res) => {
  const { companyId } = req.params;
  const { page = 1, limit = 10, role, status, search } = req.query;

  const result = await AdminService.getCompanyTeamMembers(companyId, {
    page: parseInt(page),
    limit: parseInt(limit),
    role,
    status,
    search,
  });

  sendSuccess(
    res,
    result.memberships,
    "Team members retrieved successfully",
    200,
    result.pagination
  );
});

// Remove user from company
export const removeUserFromCompany = asyncHandler(async (req, res) => {
  const { companyId, userId } = req.params;
  const removedBy = req.user.id;

  const result = await AdminService.removeUserFromCompany(
    companyId,
    userId,
    removedBy
  );

  sendSuccess(res, null, result.message);
});

// Suspend user
export const suspendUser = asyncHandler(async (req, res) => {
  const { companyId, userId } = req.params;
  const { reason } = req.body;
  const suspendedBy = req.user.id;

  const result = await AdminService.suspendUser(
    companyId,
    userId,
    suspendedBy,
    reason
  );

  sendSuccess(res, result, "User suspended successfully");
});

// Reactivate user
export const reactivateUser = asyncHandler(async (req, res) => {
  const { companyId, userId } = req.params;
  const reactivatedBy = req.user.id;

  const result = await AdminService.reactivateUser(
    companyId,
    userId,
    reactivatedBy
  );

  sendSuccess(res, result, "User reactivated successfully");
});

// Resend email verification
export const resendEmailVerification = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { companyId } = req.body;

  const result = await AdminService.resendEmailVerification(userId, companyId);

  sendSuccess(res, null, result.message);
});

// Verify email (public endpoint)
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return sendError(res, "Verification token is required", 400);
  }

  const result = await AdminService.verifyEmail(token);

  sendSuccess(res, result, "Email verified successfully");
});

// Get email verification status
export const getEmailVerificationStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // This would typically check the user's email verification status
  // For now, we'll use the existing user service
  const { getUserById } = await import("../services/userService.js");
  const user = await getUserById(userId);

  const verificationData = {
    userId: user.id,
    email: user.email,
    emailVerified: user.email_verified,
    emailVerifiedAt: user.email_verified_at,
  };

  sendSuccess(
    res,
    verificationData,
    "Email verification status retrieved successfully"
  );
});
