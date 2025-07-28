import { supabase, TABLES } from "../config/database.js";
import { NotFoundError, ConflictError } from "../middleware/errorHandler.js";

export class CompanyService {
  // Get all companies with pagination and search
  static async getCompanies(
    page = 1,
    limit = 10,
    search = "",
    sortBy = "created_at",
    sortOrder = "desc"
  ) {
    try {
      let query = supabase
        .from(TABLES.COMPANIES)
        .select("*", { count: "exact" });

      // Apply search filter
      if (search) {
        query = query.or(
          `name.ilike.%${search}%,description.ilike.%${search}%`
        );
      }

      // Apply pagination and sorting
      const offset = (page - 1) * limit;
      query = query
        .order(sortBy, { ascending: sortOrder === "asc" })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        companies: data,
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

  // Get company by ID
  static async getCompanyById(companyId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.COMPANIES)
        .select("*")
        .eq("id", companyId)
        .single();

      if (error) throw error;
      if (!data) throw new NotFoundError("Company not found");

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Create company
  static async createCompany(companyData, createdBy) {
    try {
      const companyToCreate = {
        ...companyData,
        created_by: createdBy,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from(TABLES.COMPANIES)
        .insert([companyToCreate])
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new ConflictError("Company already exists");
        }
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Update company
  static async updateCompany(companyId, updateData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.COMPANIES)
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", companyId)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new NotFoundError("Company not found");

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Delete company
  static async deleteCompany(companyId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.COMPANIES)
        .delete()
        .eq("id", companyId)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new NotFoundError("Company not found");

      return { message: "Company deleted successfully" };
    } catch (error) {
      throw error;
    }
  }

  // Get company members
  static async getCompanyMembers(companyId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
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
          )
        `,
          { count: "exact" }
        )
        .eq("company_id", companyId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        members: data,
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

  // Get company statistics
  static async getCompanyStats(companyId) {
    try {
      // Get total members
      const { count: totalMembers, error: membersError } = await supabase
        .from(TABLES.MEMBERSHIPS)
        .select("*", { count: "exact" })
        .eq("company_id", companyId)
        .eq("status", "active");

      if (membersError) throw membersError;

      // Get members by role
      const { data: roleStats, error: roleError } = await supabase
        .from(TABLES.MEMBERSHIPS)
        .select("role")
        .eq("company_id", companyId)
        .eq("status", "active");

      if (roleError) throw roleError;

      const roleCounts = roleStats.reduce((acc, member) => {
        acc[member.role] = (acc[member.role] || 0) + 1;
        return acc;
      }, {});

      return {
        totalMembers,
        roleBreakdown: roleCounts,
        activeMembers: totalMembers,
      };
    } catch (error) {
      throw error;
    }
  }

  // Search companies
  static async searchCompanies(query, limit = 10) {
    try {
      const { data, error } = await supabase
        .from(TABLES.COMPANIES)
        .select("id, name, description, logo_url, industry, size")
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Get companies by user
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
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Get company by name
  static async getCompanyByName(name) {
    try {
      const { data, error } = await supabase
        .from(TABLES.COMPANIES)
        .select("*")
        .eq("name", name)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Update company settings
  static async updateCompanySettings(companyId, settings) {
    try {
      const { data, error } = await supabase
        .from(TABLES.COMPANIES)
        .update({
          settings,
          updated_at: new Date().toISOString(),
        })
        .eq("id", companyId)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new NotFoundError("Company not found");

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Get companies by industry
  static async getCompaniesByIndustry(industry, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from(TABLES.COMPANIES)
        .select("*", { count: "exact" })
        .eq("industry", industry)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        companies: data,
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
}
