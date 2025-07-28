import express from "express";
import { MembershipController } from "../controllers/membershipController.js";
import {
  authenticateToken,
  requireCompanyAccess,
  requireCompanyAdmin,
} from "../middleware/auth.js";
import { validate, membershipSchemas } from "../middleware/validation.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Membership management routes
router.get("/", MembershipController.getMemberships);
router.post(
  "/",
  validate(membershipSchemas.create),
  MembershipController.createMembership
);
router.get("/:membershipId", MembershipController.getMembershipById);
router.put(
  "/:membershipId",
  validate(membershipSchemas.update),
  MembershipController.updateMembership
);
router.delete("/:membershipId", MembershipController.deleteMembership);

// Company-specific membership routes
router.post(
  "/company/:companyId/invite",
  requireCompanyAdmin,
  validate(membershipSchemas.invite),
  MembershipController.inviteUserToCompany
);
router.get(
  "/company/:companyId/stats",
  requireCompanyAccess,
  MembershipController.getMembershipStats
);

// Invitation management
router.get("/invitations/pending", MembershipController.getPendingInvitations);
router.put("/:membershipId/accept", MembershipController.acceptInvitation);
router.put("/:membershipId/reject", MembershipController.rejectInvitation);

// Member management (admin only)
router.put(
  "/:membershipId/role",
  requireCompanyAdmin,
  MembershipController.updateMemberRole
);
router.put(
  "/:membershipId/suspend",
  requireCompanyAdmin,
  MembershipController.suspendMember
);
router.put(
  "/:membershipId/reactivate",
  requireCompanyAdmin,
  MembershipController.reactivateMember
);
router.put(
  "/:membershipId/permissions",
  requireCompanyAdmin,
  MembershipController.updateMemberPermissions
);

// User-company membership routes
router.get(
  "/user/:userId/company/:companyId",
  MembershipController.getUserCompanyMembership
);
router.get(
  "/me/company/:companyId",
  MembershipController.getCurrentUserCompanyMembership
);

export default router;
