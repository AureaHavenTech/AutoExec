-- SQLite schema for AutoExec application

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'starter', -- 'starter', 'pro', 'unlimited'
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'canceled'
  stripe_subscription_id TEXT UNIQUE,
  current_period_end TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tasks Table (App Users' tasks submitted to AutoExec)
CREATE TABLE IF NOT EXISTS app_tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  result TEXT, -- Detailed JSON or text results from the agent execution
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_app_tasks_user_id ON app_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_app_tasks_status ON app_tasks(status);

-- Admin / Owner Support
-- Add is_admin column to users (will be added via ALTER TABLE for existing DBs)
-- But for fresh schema creation, include it in the CREATE TABLE
ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0;

-- Owner/Gift Codes table
CREATE TABLE IF NOT EXISTS owner_codes (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  user_id TEXT,
  description TEXT,
  is_gift INTEGER NOT NULL DEFAULT 0,
  used INTEGER NOT NULL DEFAULT 0,
  max_uses INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert the owner registration code
INSERT OR IGNORE INTO owner_codes (id, code, description, is_gift, max_uses) 
VALUES ('owner_master_code', 'AUREA2026', 'Owner registration code - grants admin access', 0, 9999);
