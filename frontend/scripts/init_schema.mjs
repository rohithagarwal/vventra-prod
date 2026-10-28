import { neon } from "@neondatabase/serverless";
import * as fs from "fs";

const env = fs.readFileSync(".env.local", "utf8");
const match = env.match(/DATABASE_URL="([^"]+)"/);
if (!match) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}

const sql = neon(match[1]);

async function runMigration() {
  console.log("=== Initializing vvEntra Schema on Neon PostgreSQL ===");

  // 1. Extensions
  console.log("1. Creating pgcrypto / uuid extensions...");
  await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`;

  // 2. Users Table
  console.log("2. Creating 'users' table...");
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(320) UNIQUE NOT NULL,
      password_hash VARCHAR(255),
      full_name VARCHAR(200),
      role VARCHAR(20) NOT NULL CHECK (role IN ('investor', 'architect', 'admin')),
      status VARCHAR(20) NOT NULL DEFAULT 'onboarding' CHECK (status IN ('onboarding', 'pending_review', 'active', 'suspended')),
      email_verified_at TIMESTAMPTZ,
      google_sub VARCHAR(255) UNIQUE,
      reviewed_at TIMESTAMPTZ,
      reviewed_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
      last_login_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      CONSTRAINT ck_users_email_lowercase CHECK (email = lower(email))
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS ix_users_status ON users(status);`;
  await sql`CREATE INDEX IF NOT EXISTS ix_users_email ON users(email);`;

  // 3. Investor Profiles Table
  console.log("3. Creating 'investor_profiles' table...");
  await sql`
    CREATE TABLE IF NOT EXISTS investor_profiles (
      user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      focus VARCHAR(120),
      location VARCHAR(120),
      sectors VARCHAR(40)[] DEFAULT '{}',
      additional_notes TEXT,
      looking_for TEXT,
      capital_range VARCHAR(20) CHECK (capital_range IN ('under_10k', '10k_50k', '50k_250k', '250k_1m', 'over_1m', 'exploring')),
      deployment_timeline VARCHAR(20) CHECK (deployment_timeline IN ('now', 'within_3_months', 'within_12_months', 'exploring')),
      linkedin_url VARCHAR(500),
      is_linkedin_verified BOOLEAN DEFAULT false,
      linkedin_verified_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  // 4. Architect Profiles Table
  console.log("4. Creating 'architect_profiles' table...");
  await sql`
    CREATE TABLE IF NOT EXISTS architect_profiles (
      user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      headline VARCHAR(120),
      location VARCHAR(120),
      sectors VARCHAR(40)[] DEFAULT '{}',
      additional_notes TEXT,
      opportunity_description TEXT,
      doc_depth VARCHAR(30) CHECK (doc_depth IN ('90_120_pages', '120_150_pages', '150_plus_pages', 'still_planning')),
      submission_timeline VARCHAR(30) CHECK (submission_timeline IN ('within_30_days', 'within_3_months', 'later_this_year', 'exploring')),
      linkedin_url VARCHAR(500),
      is_linkedin_verified BOOLEAN DEFAULT false,
      linkedin_verified_at TIMESTAMPTZ,
      payout_account_id VARCHAR(255),
      payout_provider VARCHAR(50) DEFAULT 'stripe',
      payout_bank_name VARCHAR(100),
      payout_last4 VARCHAR(10),
      payout_currency VARCHAR(10) DEFAULT 'USD',
      is_payout_connected BOOLEAN DEFAULT false,
      payout_connected_at TIMESTAMPTZ,
      user_video BYTEA,
      user_video_content_type VARCHAR(50) DEFAULT 'video/webm',
      is_video_submitted BOOLEAN DEFAULT false,
      video_submitted_at TIMESTAMPTZ,
      is_video_verified VARCHAR(20) DEFAULT 'False',
      video_verified_at TIMESTAMPTZ,
      user_photo TEXT,
      background_image VARCHAR(255),
      about TEXT,
      skills VARCHAR(80)[] DEFAULT '{}',
      languages JSON DEFAULT '[]',
      market_insight_widgets VARCHAR(80)[] DEFAULT '{}',
      experience JSON DEFAULT '[]',
      education JSON DEFAULT '[]',
      profile_visibility VARCHAR(20) DEFAULT 'Private',
      email_notifications BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  // 5. Refresh Tokens Table
  console.log("5. Creating 'refresh_tokens' table...");
  await sql`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash VARCHAR(64) UNIQUE NOT NULL,
      family_id UUID NOT NULL,
      remember_me BOOLEAN DEFAULT false NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      revoked_at TIMESTAMPTZ,
      user_agent VARCHAR(255),
      ip_address VARCHAR(45),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS ix_refresh_tokens_family_id ON refresh_tokens(family_id);`;
  await sql`CREATE INDEX IF NOT EXISTS ix_refresh_tokens_user_id ON refresh_tokens(user_id);`;

  // 6. Opportunities Table
  console.log("6. Creating 'opportunities' table...");
  await sql`
    CREATE TABLE IF NOT EXISTS opportunities (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      code VARCHAR(20) UNIQUE NOT NULL,
      creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
      title VARCHAR(255) NOT NULL,
      sector VARCHAR(100) NOT NULL,
      category VARCHAR(100),
      status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'review', 'active', 'unlocked', 'archived')),
      deal_size NUMERIC(12, 2) NOT NULL DEFAULT 0,
      unlock_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
      target_return VARCHAR(100),
      timeline VARCHAR(100),
      headline TEXT,
      summary TEXT,
      problem_statement TEXT,
      solution_overview TEXT,
      market_size TEXT,
      business_model TEXT,
      doc_depth_pages INT DEFAULT 90,
      readiness_score INT DEFAULT 0,
      financial_model JSONB DEFAULT '{}',
      is_featured BOOLEAN DEFAULT false,
      published_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS ix_opportunities_code ON opportunities(code);`;
  await sql`CREATE INDEX IF NOT EXISTS ix_opportunities_sector ON opportunities(sector);`;
  await sql`CREATE INDEX IF NOT EXISTS ix_opportunities_status ON opportunities(status);`;

  // 7. Access Requests & Staged Unlock Table
  console.log("7. Creating 'access_requests' table...");
  await sql`
    CREATE TABLE IF NOT EXISTS access_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
      buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      tier INT NOT NULL DEFAULT 1 CHECK (tier IN (1, 2, 3, 4)),
      status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined', 'completed', 'disputed')),
      deposit_amount NUMERIC(12, 2) DEFAULT 0,
      nda_signed BOOLEAN DEFAULT false,
      nda_signed_at TIMESTAMPTZ,
      inspection_ends_at TIMESTAMPTZ,
      architect_note TEXT,
      buyer_note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      CONSTRAINT uq_opportunity_buyer_tier UNIQUE (opportunity_id, buyer_id, tier)
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS ix_access_requests_buyer ON access_requests(buyer_id);`;
  await sql`CREATE INDEX IF NOT EXISTS ix_access_requests_opportunity ON access_requests(opportunity_id);`;

  // Verify created tables
  console.log("=== Verification ===");
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `;
  console.log("Successfully created tables:", tables.map(t => t.table_name));
}

runMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
