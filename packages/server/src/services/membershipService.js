import { supabase, TABLES } from "../config/database.js";
import { NotFoundError, ConflictError } from "../middleware/errorHandler.js";

export class MembershipService {
  // Get all memberships with pagination and filters
  static async getMemberships(page = 1, limit = 10, filters = {}) {
    try {
      let query = supabase.from(TABLES.MEMBERSHIPS).select(
        `
          *,
          users (
            id,
            full_name,
            email,
            avatar_url,
            global_role
          ),
          companies (
            id,
            name,
            logo_url
          )
        `,
        { count: "exact" }
      );

      // Apply filters
      if (filters.userId) {
        query = query.eq("user_id", filters.userId);
      }
      if (filters.companyId) {
        query = query.eq("company_id", filters.companyId);
      }
      if (filters.role) {
        query = query.eq("role", filters.role);
      }
      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        memberships: data,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Get membership by ID
  static async getMembershipById(membershipId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.MEMBERSHIPS)
        .select(
          `
          *,
          users (
            id,
            full_name,
            email,
            avatar_url,
            global_role
          ),
          companies (
            id,
            name,
            logo_url,
            description
          )
        `
        )
        .eq("id", membershipId)
        .single();

      if (error) throw error;
      if (!data) throw new NotFoundError("Membership not found");

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Create membership
  static async createMembership(membershipData) {
    try {
      const membershipToCreate = {
        ...membershipData,
        status: membershipData.status || "active",
        invited_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from(TABLES.MEMBERSHIPS)
        .insert([membershipToCreate])
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new ConflictError("Membership already exists");
        }
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Update membership
  static async updateMembership(membershipId, updateData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.MEMBERSHIPS)
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", membershipId)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new NotFoundError("Membership not found");

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Delete membership
  static async deleteMembership(membershipId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.MEMBERSHIPS)
        .delete()
        .eq("id", membershipId)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new NotFoundError("Membership not found");

      return { message: "Membership deleted successfully" };
    } catch (error) {
      throw error;
    }
  }

  // Get user's membership in a company
  static async getUserCompanyMembership(userId, companyId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.MEMBERSHIPS)
        .select("*")
        .eq("user_id", userId)
        .eq("company_id", companyId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Invite user to company
  static async inviteUserToCompany(inviteData, invitedBy) {
    try {
      // First, find the user by email
      const { data: user, error: userError } = await supabase
        .from(TABLES.USERS)
        .select("id, email")
        .eq("email", inviteData.email)
        .single();

      if (userError || !user) {
        throw new NotFoundError("User not found with this email");
      }

      // Check if membership already exists
      const existingMembership = await this.getUserCompanyMembership(
        user.id,
        inviteData.companyId
      );
      if (existingMembership) {
        throw new ConflictError("User is already a member of this company");
      }

      // Create membership
      const membershipData = {
        user_id: user.id,
        company_id: inviteData.companyId,
        role: inviteData.role,
        title: inviteData.title,
        department: inviteData.department,
        permissions: inviteData.permissions || {},
        invited_by: invitedBy,
        status: "pending",
      };

      return await this.createMembership(membershipData);
    } catch (error) {
      throw error;
    }
  }

  // Accept invitation
  static async acceptInvitation(membershipId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.MEMBERSHIPS)
        .update({
          status: "active",
          joined_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", membershipId)
        .eq("status", "pending")
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new NotFoundError("Pending invitation not found");

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Reject invitation
  static async rejectInvitation(membershipId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.MEMBERSHIPS)
        .update({
          status: "inactive",
          updated_at: new Date().toISOString(),
        })
        .eq("id", membershipId)
        .eq("status", "pending")
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new NotFoundError("Pending invitation not found");

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Update member role
  static async updateMemberRole(membershipId, newRole) {
    try {
      const { data, error } = await supabase
        .from(TABLES.MEMBERSHIPS)
        .update({
          role: newRole,
          updated_at: new Date().toISOString(),
        })
        .eq("id", membershipId)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new NotFoundError("Membership not found");

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Suspend member
  static async suspendMember(membershipId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.MEMBERSHIPS)
        .update({
          status: "suspended",
          updated_at: new Date().toISOString(),
        })
        .eq("id", membershipId)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new NotFoundError("Membership not found");

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Reactivate member
  static async reactivateMember(membershipId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.MEMBERSHIPS)
        .update({
          status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("id", membershipId)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new NotFoundError("Membership not found");

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Get pending invitations for a user
  static async getPendingInvitations(userId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.MEMBERSHIPS)
        .select(
          `
          *,
          companies (
            id,
            name,
            logo_url,
            description
          ),
          users!memberships_invited_by_fkey (
            id,
            full_name,
            email
          )
        `
        )
        .eq("user_id", userId)
        .eq("status", "pending")
        .order("invited_at", { ascending: false });

      if (error) throw error;

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Get membership statistics
  static async getMembershipStats(companyId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.MEMBERSHIPS)
        .select("role, status")
        .eq("company_id", companyId);

      if (error) throw error;

      const stats = {
        total: data.length,
        active: data.filter((m) => m.status === "active").length,
        pending: data.filter((m) => m.status === "pending").length,
        suspended: data.filter((m) => m.status === "suspended").length,
        roleBreakdown: {},
      };

      // Count by role
      data.forEach((membership) => {
        if (membership.status === "active") {
          stats.roleBreakdown[membership.role] =
            (stats.roleBreakdown[membership.role] || 0) + 1;
        }
      });

      return stats;
    } catch (error) {
      throw error;
    }
  }

  // Bulk update member permissions
  static async updateMemberPermissions(membershipId, permissions) {
    try {
      const { data, error } = await supabase
        .from(TABLES.MEMBERSHIPS)
        .update({
          permissions,
          updated_at: new Date().toISOString(),
        })
        .eq("id", membershipId)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new NotFoundError("Membership not found");

      return data;
    } catch (error) {
      throw error;
    }
  }
}
