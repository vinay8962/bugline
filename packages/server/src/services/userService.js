import { supabase, TABLES } from "../config/database.js";
import { NotFoundError, ConflictError } from "../middleware/errorHandler.js";

export class UserService {
  // Get all users with pagination and search
  static async getUsers(
    page = 1,
    limit = 10,
    search = "",
    sortBy = "created_at",
    sortOrder = "desc"
  ) {
    try {
      let query = supabase.from(TABLES.USERS).select("*", { count: "exact" });

      // Apply search filter
      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      // Apply pagination and sorting
      const offset = (page - 1) * limit;
      query = query
        .order(sortBy, { ascending: sortOrder === "asc" })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        users: data,
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

  // Get user by ID
  static async getUserById(userId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      if (!data) throw new NotFoundError("User not found");

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Get user by email
  static async getUserByEmail(email) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select("*")
        .eq("email", email)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Create user profile
  static async createUser(userData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .insert([userData])
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new ConflictError("User already exists");
        }
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Update user profile
  static async updateUser(userId, updateData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .update(updateData)
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new NotFoundError("User not found");

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Update user global role
  static async updateUserRole(userId, globalRole) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .update({ global_role: globalRole })
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new NotFoundError("User not found");

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Delete user (soft delete by setting status)
  static async deleteUser(userId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .update({
          updated_at: new Date().toISOString(),
          // You might want to add a deleted_at field for soft deletes
        })
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new NotFoundError("User not found");

      return { message: "User deleted successfully" };
    } catch (error) {
      throw error;
    }
  }

  // Get user's companies and memberships
  static async getUserCompanies(userId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.MEMBERSHIPS)
        .select(
          `
          *,
          companies (*)
        `
        )
        .eq("user_id", userId)
        .eq("status", "active");

      if (error) throw error;

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Get user's company membership details
  static async getUserCompanyMembership(userId, companyId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.MEMBERSHIPS)
        .select("*")
        .eq("user_id", userId)
        .eq("company_id", companyId)
        .single();

      if (error) throw error;
      if (!data) throw new NotFoundError("Membership not found");

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Search users
  static async searchUsers(query, limit = 10) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select("id, full_name, email, avatar_url")
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Get user statistics
  static async getUserStats(userId) {
    try {
      // Get user's company count
      const { count: companyCount, error: companyError } = await supabase
        .from(TABLES.MEMBERSHIPS)
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .eq("status", "active");

      if (companyError) throw companyError;

      // Get user's admin company count
      const { count: adminCount, error: adminError } = await supabase
        .from(TABLES.MEMBERSHIPS)
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .eq("role", "admin")
        .eq("status", "active");

      if (adminError) throw adminError;

      return {
        totalCompanies: companyCount,
        adminCompanies: adminCount,
        memberCompanies: companyCount - adminCount,
      };
    } catch (error) {
      throw error;
    }
  }
}
