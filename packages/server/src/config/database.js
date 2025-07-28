import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Client for regular operations (with RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for bypassing RLS (use carefully)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Database tables
export const TABLES = {
  USERS: "users",
  COMPANIES: "companies",
  MEMBERSHIPS: "memberships",
};

// User roles
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  USER: "user",
};

// Company roles
export const COMPANY_ROLES = {
  ADMIN: "admin",
  DEV: "dev",
  BUG_REPORTER: "bug_reporter",
  VIEWER: "viewer",
};

// Membership status
export const MEMBERSHIP_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
  SUSPENDED: "suspended",
};

// Company sizes
export const COMPANY_SIZES = {
  STARTUP: "startup",
  SMALL: "small",
  MEDIUM: "medium",
  LARGE: "large",
  ENTERPRISE: "enterprise",
};
