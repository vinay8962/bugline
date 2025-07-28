import { MembershipService } from "../services/membershipService.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export class MembershipController {
  // Get all memberships with filters
  static getMemberships = asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 10,
      user_id,
      company_id,
      role,
      status,
    } = req.query;

    const filters = {};
    if (user_id) filters.userId = user_id;
    if (company_id) filters.companyId = company_id;
    if (role) filters.role = role;
    if (status) filters.status = status;

    const result = await MembershipService.getMemberships(
      parseInt(page),
      parseInt(limit),
      filters
    );

    res.status(200).json({
      success: true,
      data: result.memberships,
      pagination: result.pagination,
    });
  });

  // Get membership by ID
  static getMembershipById = asyncHandler(async (req, res) => {
    const { membershipId } = req.params;

    const membership = await MembershipService.getMembershipById(membershipId);

    res.status(200).json({
      success: true,
      data: membership,
    });
  });

  // Create membership
  static createMembership = asyncHandler(async (req, res) => {
    const membership = await MembershipService.createMembership(req.body);

    res.status(201).json({
      success: true,
      data: membership,
      message: "Membership created successfully",
    });
  });

  // Update membership
  static updateMembership = asyncHandler(async (req, res) => {
    const { membershipId } = req.params;

    const updatedMembership = await MembershipService.updateMembership(
      membershipId,
      req.body
    );

    res.status(200).json({
      success: true,
      data: updatedMembership,
      message: "Membership updated successfully",
    });
  });

  // Delete membership
  static deleteMembership = asyncHandler(async (req, res) => {
    const { membershipId } = req.params;

    await MembershipService.deleteMembership(membershipId);

    res.status(200).json({
      success: true,
      message: "Membership deleted successfully",
    });
  });

  // Invite user to company
  static inviteUserToCompany = asyncHandler(async (req, res) => {
    const { companyId } = req.params;

    const membership = await MembershipService.inviteUserToCompany(
      { ...req.body, companyId },
      req.user.id
    );

    res.status(201).json({
      success: true,
      data: membership,
      message: "Invitation sent successfully",
    });
  });

  // Accept invitation
  static acceptInvitation = asyncHandler(async (req, res) => {
    const { membershipId } = req.params;

    const membership = await MembershipService.acceptInvitation(membershipId);

    res.status(200).json({
      success: true,
      data: membership,
      message: "Invitation accepted successfully",
    });
  });

  // Reject invitation
  static rejectInvitation = asyncHandler(async (req, res) => {
    const { membershipId } = req.params;

    const membership = await MembershipService.rejectInvitation(membershipId);

    res.status(200).json({
      success: true,
      data: membership,
      message: "Invitation rejected successfully",
    });
  });

  // Update member role
  static updateMemberRole = asyncHandler(async (req, res) => {
    const { membershipId } = req.params;
    const { role } = req.body;

    const membership = await MembershipService.updateMemberRole(
      membershipId,
      role
    );

    res.status(200).json({
      success: true,
      data: membership,
      message: "Member role updated successfully",
    });
  });

  // Suspend member
  static suspendMember = asyncHandler(async (req, res) => {
    const { membershipId } = req.params;

    const membership = await MembershipService.suspendMember(membershipId);

    res.status(200).json({
      success: true,
      data: membership,
      message: "Member suspended successfully",
    });
  });

  // Reactivate member
  static reactivateMember = asyncHandler(async (req, res) => {
    const { membershipId } = req.params;

    const membership = await MembershipService.reactivateMember(membershipId);

    res.status(200).json({
      success: true,
      data: membership,
      message: "Member reactivated successfully",
    });
  });

  // Get pending invitations for current user
  static getPendingInvitations = asyncHandler(async (req, res) => {
    const invitations = await MembershipService.getPendingInvitations(
      req.user.id
    );

    res.status(200).json({
      success: true,
      data: invitations,
    });
  });

  // Get membership statistics
  static getMembershipStats = asyncHandler(async (req, res) => {
    const { companyId } = req.params;

    const stats = await MembershipService.getMembershipStats(companyId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  });

  // Update member permissions
  static updateMemberPermissions = asyncHandler(async (req, res) => {
    const { membershipId } = req.params;
    const { permissions } = req.body;

    const membership = await MembershipService.updateMemberPermissions(
      membershipId,
      permissions
    );

    res.status(200).json({
      success: true,
      data: membership,
      message: "Member permissions updated successfully",
    });
  });

  // Get user's membership in a company
  static getUserCompanyMembership = asyncHandler(async (req, res) => {
    const { userId, companyId } = req.params;

    const membership = await MembershipService.getUserCompanyMembership(
      userId,
      companyId
    );

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: "Membership not found",
      });
    }

    res.status(200).json({
      success: true,
      data: membership,
    });
  });

  // Get current user's membership in a company
  static getCurrentUserCompanyMembership = asyncHandler(async (req, res) => {
    const { companyId } = req.params;

    const membership = await MembershipService.getUserCompanyMembership(
      req.user.id,
      companyId
    );

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: "Membership not found",
      });
    }

    res.status(200).json({
      success: true,
      data: membership,
    });
  });
}
