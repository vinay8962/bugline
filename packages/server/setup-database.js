#!/usr/bin/env node

/**
 * Database Setup Script for BugLine
 * Creates the required tables in Supabase
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

// Admin client for bypassing RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log("🚀 Setting up BugLine database...\n");

  try {
    // Create users table
    console.log("📝 Creating users table...");
    const { error: usersError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255),
          full_name VARCHAR(255),
          phone VARCHAR(50),
          avatar_url TEXT,
          global_role VARCHAR(50) DEFAULT 'user',
          bio TEXT,
          timezone VARCHAR(50) DEFAULT 'UTC',
          email_verified BOOLEAN DEFAULT false,
          email_verified_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `,
    });

    if (usersError) {
      console.log("Users table already exists or error:", usersError.message);
    } else {
      console.log("✅ Users table created successfully");
    }

    // Create companies table
    console.log("📝 Creating companies table...");
    const { error: companiesError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS companies (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          description TEXT,
          logo_url TEXT,
          website VARCHAR(500),
          settings JSONB DEFAULT '{}',
          industry VARCHAR(100),
          size VARCHAR(50),
          created_by UUID REFERENCES users(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `,
    });

    if (companiesError) {
      console.log(
        "Companies table already exists or error:",
        companiesError.message
      );
    } else {
      console.log("✅ Companies table created successfully");
    }

    // Create memberships table
    console.log("📝 Creating memberships table...");
    const { error: membershipsError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS memberships (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
          role VARCHAR(50) NOT NULL,
          permissions JSONB DEFAULT '{}',
          title VARCHAR(255),
          department VARCHAR(100),
          status VARCHAR(50) DEFAULT 'active',
          invited_by UUID REFERENCES users(id),
          invited_at TIMESTAMP,
          joined_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, company_id)
        );
      `,
    });

    if (membershipsError) {
      console.log(
        "Memberships table already exists or error:",
        membershipsError.message
      );
    } else {
      console.log("✅ Memberships table created successfully");
    }

    // Create indexes for better performance
    console.log("📝 Creating indexes...");
    const { error: indexesError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON memberships(user_id);
        CREATE INDEX IF NOT EXISTS idx_memberships_company_id ON memberships(company_id);
        CREATE INDEX IF NOT EXISTS idx_memberships_status ON memberships(status);
      `,
    });

    if (indexesError) {
      console.log("Indexes already exist or error:", indexesError.message);
    } else {
      console.log("✅ Indexes created successfully");
    }

    console.log("\n🎉 Database setup completed successfully!");
    console.log("You can now test the API endpoints.");
  } catch (error) {
    console.error("❌ Database setup failed:", error);
    process.exit(1);
  }
}

// Run setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase().catch(console.error);
}

export { setupDatabase };
