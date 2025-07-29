import { supabase, TABLES, COMPANY_ROLES } from "../config/database.js";
import { UserService } from "./userService.js";
import { MembershipService } from "./membershipService.js";
import { EmailService } from "./emailService.js";
import { NotFoundError, ConflictError, ValidationError } from "../middleware/errorHandler.js";
import bcrypt from "bcryptjs";

export class AdminService {
  // Create user account and assign to company with role
  static async createUserForCompany(companyId, userData, createdBy) {
    try {
      const { email, full_name, role, send_invitation = true } = userData;

      // Validate role
      if (!Object.values(COMPANY_ROLES).includes(role)) {
        throw new ValidationError(`Invalid role: ${role}`);
      }

      // Check if user already exists
      let existingUser;
      try {
        existingUser = await UserService.getUserByEmail(email);
      } catch (error) {
        // User doesn't exist, which is what we want
      }

      let user;
      let isNewUser = false;

      if (existingUser) {
        // User exists, check if already a member of this company
        const existingMembership = await MembershipService.getUserCompanyMembership(
          existingUser.id,
          companyId
        );
        
        if (existingMembership) {
          throw new ConflictError("User is already a member of this company");
        }
        
        user = existingUser;
      } else {
        // Create new user account
        isNewUser = true;
        const hashedPassword = await bcrypt.hash(
          Math.random().toString(36).slice(-8), // Temporary password
          12
        );

        const newUserData = {
          email,
          full_name: full_name || email.split('@')[0],
          global_role: "user",
          email_verified: false,
          password_hash: hashedPassword,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        user = await UserService.createUser(newUserData);
      }

      // Create membership
      const membershipData = {
        user_id: user.id,
        company_id: companyId,
        role,
        status: "pending", // User needs to verify email first
        invited_by: createdBy,
        invited_at: new Date().toISOString(),
        permissions: this.getDefaultPermissionsForRole(role),
      };

      const membership = await MembershipService.createMembership(membershipData);

      // Send invitation/verification email if requested
      if (send_invitation) {
        try {
          // Get company details for email
          const { data: company } = await supabase
            .from(TABLES.COMPANIES)
            .select("name, description")
            .eq("id", companyId)
            .single();

          // Get inviter details
          const inviter = await UserService.getUserById(createdBy);

          if (isNewUser) {
            await EmailService.sendInvitationEmail(user, company, inviter, role);
          } else {
            await EmailService.sendEmailVerification(user, company?.name);
          }
        } catch (emailError) {
          // Log error but don't fail the user creation if email fails
          // In production, you might want to use a proper logging service
          if (process.env.NODE_ENV === 'development') {
            console.error("Failed to send invitation email:", emailError);
          }
        }
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          email_verified: user.email_verified,
        },
        membership: {
          id: membership.id,
          role: membership.role,
          status: membership.status,
          permissions: membership.permissions,
          invited_at: membership.invited_at,
        },
        isNewUser,
      };
    } catch (error) {
      throw error;
    }
  }

  // Bulk create users from CSV or array
  static async bulkCreateUsers(companyId, usersData, createdBy) {
    try {
      const results = {
        success: [],
        errors: [],
        total: usersData.length,
      };

      for (const userData of usersData) {
        try {
          const result = await this.createUserForCompany(
            companyId,
            { ...userData, send_invitation: false }, // Send emails in batch later
            createdBy
          );
          results.success.push({
            email: userData.email,
            result,
          });
        } catch (error) {
          results.errors.push({
            email: userData.email,
            error: error.message,
          });
        }
      }

      return results;
    } catch (error) {
      throw error;
    }
  }

  // Update user role in company
  static async updateUserRole(companyId, userId, newRole, updatedBy) {
    try {
      // Validate role
      if (!Object.values(COMPANY_ROLES).includes(newRole)) {
        throw new ValidationError(`Invalid role: ${newRole}`);
      }

      // Get membership
      const membership = await MembershipService.getUserCompanyMembership(userId, companyId);
      if (!membership) {
        throw new NotFoundError("User is not a member of this company");
      }

      // Update role and permissions
      const updatedMembership = await MembershipService.updateMembership(
        membership.id,
        {
          role: newRole,
          permissions: this.getDefaultPermissionsForRole(newRole),
          updated_by: updatedBy,
        }
      );

      return updatedMembership;
    } catch (error) {
      throw error;
    }
  }

  // Resend email verification
  static async resendEmailVerification(userId, companyId) {
    try {
      const user = await UserService.getUserById(userId);
      
      if (user.email_verified) {
        throw new ValidationError("Email is already verified");
      }

      // Get company details if provided
      let company = null;
      if (companyId) {
        const { data } = await supabase
          .from(TABLES.COMPANIES)
          .select("name")
          .eq("id", companyId)
          .single();
        company = data;
      }

      await EmailService.sendEmailVerification(user, company?.name);

      return { message: "Verification email sent successfully" };
    } catch (error) {
      throw error;
    }
  }

  // Verify email address
  static async verifyEmail(token) {
    try {
      const decoded = EmailService.verifyEmailToken(token);
      
      // Update user's email verification status
      const updatedUser = await UserService.updateUser(decoded.userId, {
        email_verified: true,
        email_verified_at: new Date().toISOString(),
      });

      // Activate any pending memberships for this user
      const { data: pendingMemberships } = await supabase
        .from(TABLES.MEMBERSHIPS)
        .select("*")
        .eq("user_id", decoded.userId)
        .eq("status", "pending");

      if (pendingMemberships?.length > 0) {
        for (const membership of pendingMemberships) {
          await MembershipService.updateMembership(membership.id, {
            status: "active",
            joined_at: new Date().toISOString(),
          });
        }
      }

      return {
        user: updatedUser,
        activatedMemberships: pendingMemberships?.length || 0,
      };
    } catch (error) {
      throw error;
    }
  }

  // Get default permissions for a role
  static getDefaultPermissionsForRole(role) {
    const permissionSets = {
      [COMPANY_ROLES.ADMIN]: {
        users: { create: true, read: true, update: true, delete: true },
        bugs: { create: true, read: true, update: true, delete: true },
        projects: { create: true, read: true, update: true, delete: true },
        reports: { create: true, read: true, update: true, delete: true },
        settings: { read: true, update: true },
      },
      [COMPANY_ROLES.DEV]: {
        users: { read: true },
        bugs: { create: true, read: true, update: true, delete: false },
        projects: { create: false, read: true, update: true, delete: false },
        reports: { create: true, read: true, update: false, delete: false },
        settings: { read: true, update: false },
      },
      [COMPANY_ROLES.BUG_REPORTER]: {
        users: { read: true },
        bugs: { create: true, read: true, update: false, delete: false },
        projects: { read: true },
        reports: { create: true, read: true, update: false, delete: false },
        settings: { read: true, update: false },
      },
      [COMPANY_ROLES.VIEWER]: {
        users: { read: true },
        bugs: { read: true },
        projects: { read: true },
        reports: { read: true },
        settings: { read: true, update: false },
      },
    };

    return permissionSets[role] || permissionSets[COMPANY_ROLES.VIEWER];
  }

  // Get company team members with pagination and filtering
  static async getCompanyTeamMembers(companyId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        role = null,
        status = null,
        search = "",
      } = options;

      const filters = { companyId };
      if (role) filters.role = role;
      if (status) filters.status = status;

      const result = await MembershipService.getMemberships(page, limit, filters);

      // Apply search filter if provided
      if (search) {
        result.memberships = result.memberships.filter(membership =>
          membership.users?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
          membership.users?.email?.toLowerCase().includes(search.toLowerCase())
        );
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  // Remove user from company
  static async removeUserFromCompany(companyId, userId, _removedBy) {
    try {
      const membership = await MembershipService.getUserCompanyMembership(userId, companyId);
      if (!membership) {
        throw new NotFoundError("User is not a member of this company");
      }

      // Don't allow removing the last admin
      if (membership.role === COMPANY_ROLES.ADMIN) {
        const { count: adminCount } = await supabase
          .from(TABLES.MEMBERSHIPS)
          .select("*", { count: "exact" })
          .eq("company_id", companyId)
          .eq("role", COMPANY_ROLES.ADMIN)
          .eq("status", "active");

        if (adminCount <= 1) {
          throw new ValidationError("Cannot remove the last admin from the company");
        }
      }

      await MembershipService.deleteMembership(membership.id);

      return { message: "User removed from company successfully" };
    } catch (error) {
      throw error;
    }
  }

  // Suspend user in company
  static async suspendUser(companyId, userId, suspendedBy, reason = null) {
    try {
      const membership = await MembershipService.getUserCompanyMembership(userId, companyId);
      if (!membership) {
        throw new NotFoundError("User is not a member of this company");
      }

      const updatedMembership = await MembershipService.updateMembership(
        membership.id,
        {
          status: "suspended",
          suspended_by: suspendedBy,
          suspended_at: new Date().toISOString(),
          suspension_reason: reason,
        }
      );

      return updatedMembership;
    } catch (error) {
      throw error;
    }
  }

  // Reactivate suspended user
  static async reactivateUser(companyId, userId, reactivatedBy) {
    try {
      const membership = await MembershipService.getUserCompanyMembership(userId, companyId);
      if (!membership) {
        throw new NotFoundError("User is not a member of this company");
      }

      const updatedMembership = await MembershipService.updateMembership(
        membership.id,
        {
          status: "active",
          reactivated_by: reactivatedBy,
          reactivated_at: new Date().toISOString(),
          suspended_by: null,
          suspended_at: null,
          suspension_reason: null,
        }
      );

      return updatedMembership;
    } catch (error) {
      throw error;
    }
  }
}