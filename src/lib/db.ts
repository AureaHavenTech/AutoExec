import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Define the database file path
// We put it in the root of the project for simplicity and persistent storage.
const DB_PATH = path.resolve(process.cwd(), 'autoexec.db');

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  // Ensure directory exists (though DB_PATH is in process.cwd(), which always exists)
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Open the SQLite database
  const db = new Database(DB_PATH, { verbose: console.log });
  db.pragma('journal_mode = WAL'); // Good for concurrent read/write
  db.pragma('foreign_keys = ON');  // Enforce foreign key constraints

  // Initialize schema if not already initialized
  // We check if the 'users' table exists to determine if we need to run the schema
  const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
  
  if (!tableCheck) {
    console.log('Initializing SQLite database schema...');
    try {
      const schemaPath = path.resolve(process.cwd(), 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        db.exec(schemaSql);
        console.log('Database schema initialized successfully!');

        // Ensure is_admin column exists (for DBs created before this schema update)
        try {
          db.exec('ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0');
        } catch (e: any) {
          // Column already exists — ignore
        }

        // Seed owner codes
        try {
          db.exec(`
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
            INSERT OR IGNORE INTO owner_codes (id, code, description, is_gift, max_uses) 
            VALUES ('owner_master_code', 'AUREA2026', 'Owner registration code - grants admin access', 0, 9999);
          `);
        } catch (e: any) {
          console.log('Owner codes setup (may already exist):', e.message);
        }
        
        // Seed a default mock user for testing if needed
        const insertUser = db.prepare('INSERT OR IGNORE INTO users (id, email, name) VALUES (?, ?, ?)');
        insertUser.run('user_demo_id', 'demo@autoexec.ai', 'Demo Founder');
        
        // Seed default active subscription for demo user
        const insertSub = db.prepare('INSERT OR IGNORE INTO subscriptions (id, user_id, tier, status) VALUES (?, ?, ?, ?)');
        insertSub.run('sub_demo_id', 'user_demo_id', 'pro', 'active');
        
        // Seed some mock tasks for demo user to show in dashboard history
        const insertTask = db.prepare('INSERT OR IGNORE INTO app_tasks (id, user_id, description, status, result, created_at) VALUES (?, ?, ?, ?, ?, ?)');
        insertTask.run(
          'task_mock_1',
          'user_demo_id',
          'Find 50 SaaS companies hiring in SF and draft an intro email',
          'completed',
          JSON.stringify({
            summary: "Found 50 SaaS companies in San Francisco and drafted a customized intro email sequence.",
            companies_found: 50,
            emails_sent: 0,
            drafts_created: 50,
            execution_time: "1m 45s",
            results_preview: [
              { name: "Vercel", domain: "vercel.com", role: "Senior Frontend Engineer", email: "hiring@vercel.com" },
              { name: "Retool", domain: "retool.com", role: "Full Stack Engineer", email: "jobs@retool.com" },
              { name: "Linear", domain: "linear.app", role: "Product Designer", email: "careers@linear.app" }
            ]
          }),
          new Date(Date.now() - 3600000 * 4).toISOString() // 4 hours ago
        );
        insertTask.run(
          'task_mock_2',
          'user_demo_id',
          'Scrape list of early-stage AI startups raising Seed rounds and find founder emails',
          'running',
          null,
          new Date(Date.now() - 600000).toISOString() // 10 mins ago
        );
      } else {
        console.warn('schema.sql file not found at path:', schemaPath);
      }
    } catch (error) {
      console.error('Failed to initialize database schema:', error);
    }
  }

  dbInstance = db;
  return dbInstance;
}

// Helper types for the database entities
export interface User {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  tier: 'starter' | 'pro' | 'unlimited';
  status: 'active' | 'inactive' | 'canceled';
  stripe_subscription_id: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppTask {
  id: string;
  user_id: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result: string | null;
  created_at: string;
  updated_at: string;
}
