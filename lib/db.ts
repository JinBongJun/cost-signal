import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

// In Vercel serverless, use /tmp directory (writable)
// In local development, use ./data directory
const DB_PATH = process.env.DATABASE_PATH || 
  (process.env.VERCEL ? 
    path.join('/tmp', 'cost-signal.db') : 
    path.join(process.cwd(), 'data', 'cost-signal.db'));

// Ensure data directory exists (only for local development)
if (!process.env.VERCEL) {
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
}

export interface IndicatorData {
  id: number;
  week_start: string; // ISO date string (Monday of the week)
  indicator_type: 'gas' | 'cpi' | 'interest_rate' | 'unemployment';
  value: number;
  previous_value: number | null;
  change_percent: number | null;
  status: 'ok' | 'risk';
  created_at: string;
}

export interface WeeklySignal {
  id: number;
  week_start: string;
  overall_status: 'ok' | 'caution' | 'risk';
  risk_count: number;
  explanation: string | null;
  created_at: string;
}

export interface PushSubscription {
  id: number;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent: string | null;
  created_at: string;
}

class Database {
  private db: sqlite3.Database;
  private initPromise: Promise<void>;

  constructor() {
    this.db = new sqlite3.Database(DB_PATH);
    this.initPromise = this.init();
  }

  private async init(): Promise<void> {
    const run = promisify(this.db.run.bind(this.db)) as (sql: string, params?: any[]) => Promise<any>;

    // Indicators table
    await run(`
      CREATE TABLE IF NOT EXISTS indicators (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        week_start TEXT NOT NULL,
        indicator_type TEXT NOT NULL CHECK(indicator_type IN ('gas', 'cpi', 'interest_rate', 'unemployment')),
        value REAL NOT NULL,
        previous_value REAL,
        change_percent REAL,
        status TEXT NOT NULL CHECK(status IN ('ok', 'risk')),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(week_start, indicator_type)
      )
    `);

    // Weekly signals table
    await run(`
      CREATE TABLE IF NOT EXISTS weekly_signals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        week_start TEXT NOT NULL UNIQUE,
        overall_status TEXT NOT NULL CHECK(overall_status IN ('ok', 'caution', 'risk')),
        risk_count INTEGER NOT NULL,
        explanation TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await run(`CREATE INDEX IF NOT EXISTS idx_indicators_week ON indicators(week_start)`);
    await run(`CREATE INDEX IF NOT EXISTS idx_indicators_type ON indicators(indicator_type)`);

    // Push subscriptions table
    await run(`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        endpoint TEXT NOT NULL UNIQUE,
        p256dh TEXT NOT NULL,
        auth TEXT NOT NULL,
        user_agent TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Users table (for authentication)
    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        emailVerified INTEGER,
        name TEXT,
        image TEXT,
        password TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Accounts table (for OAuth providers)
    await run(`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        provider TEXT NOT NULL,
        provider_account_id TEXT NOT NULL,
        refresh_token TEXT,
        access_token TEXT,
        expires_at INTEGER,
        token_type TEXT,
        scope TEXT,
        id_token TEXT,
        session_state TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(provider, provider_account_id)
      )
    `);

    // Sessions table (for NextAuth sessions)
    await run(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        session_token TEXT NOT NULL UNIQUE,
        user_id TEXT NOT NULL,
        expires INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Verification tokens table (for email verification)
    await run(`
      CREATE TABLE IF NOT EXISTS verification_tokens (
        identifier TEXT NOT NULL,
        token TEXT NOT NULL,
        expires INTEGER NOT NULL,
        PRIMARY KEY (identifier, token)
      )
    `);

    // Subscriptions table (for Stripe subscriptions)
    await run(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        stripe_subscription_id TEXT UNIQUE,
        stripe_customer_id TEXT,
        status TEXT NOT NULL CHECK(status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid')),
        plan TEXT NOT NULL CHECK(plan IN ('monthly', 'yearly', 'early_bird')),
        current_period_start INTEGER,
        current_period_end INTEGER,
        cancel_at_period_end INTEGER DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create indexes
    await run(`CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id)`);
    await run(`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`);
    await run(`CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id)`);
    await run(`CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id)`);
  }

  private async ensureInitialized(): Promise<void> {
    await this.initPromise;
  }

  async getLatestIndicator(type: 'gas' | 'cpi' | 'interest_rate' | 'unemployment'): Promise<IndicatorData | null> {
    await this.ensureInitialized();
    const get = promisify(this.db.get.bind(this.db)) as (sql: string, params?: any[]) => Promise<any>;
    const row = await get(
      `SELECT * FROM indicators WHERE indicator_type = ? ORDER BY week_start DESC LIMIT 1`,
      [type]
    ) as IndicatorData | undefined;
    return row || null;
  }

  async getLatestWeeklySignal(): Promise<WeeklySignal | null> {
    await this.ensureInitialized();
    const get = promisify(this.db.get.bind(this.db)) as (sql: string, params?: any[]) => Promise<any>;
    const row = await get(
      `SELECT * FROM weekly_signals ORDER BY week_start DESC LIMIT 1`
    ) as WeeklySignal | undefined;
    return row || null;
  }

  async getWeeklySignal(weekStart: string): Promise<WeeklySignal | null> {
    await this.ensureInitialized();
    const get = promisify(this.db.get.bind(this.db)) as (sql: string, params?: any[]) => Promise<any>;
    const row = await get(
      `SELECT * FROM weekly_signals WHERE week_start = ?`,
      [weekStart]
    ) as WeeklySignal | undefined;
    return row || null;
  }

  async getIndicatorsForWeek(weekStart: string): Promise<IndicatorData[]> {
    await this.ensureInitialized();
    const all = promisify(this.db.all.bind(this.db)) as (sql: string, params?: any[]) => Promise<any[]>;
    const rows = await all(
      `SELECT * FROM indicators WHERE week_start = ? ORDER BY indicator_type`,
      [weekStart]
    ) as IndicatorData[];
    return rows;
  }

  async saveIndicator(data: Omit<IndicatorData, 'id' | 'created_at'>): Promise<void> {
    await this.ensureInitialized();
    const run = promisify(this.db.run.bind(this.db)) as (sql: string, params?: any[]) => Promise<any>;
    await run(
      `INSERT OR REPLACE INTO indicators (week_start, indicator_type, value, previous_value, change_percent, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [data.week_start, data.indicator_type, data.value, data.previous_value, data.change_percent, data.status]
    );
  }

  async saveWeeklySignal(data: Omit<WeeklySignal, 'id' | 'created_at'>): Promise<void> {
    await this.ensureInitialized();
    const run = promisify(this.db.run.bind(this.db)) as (sql: string, params?: any[]) => Promise<any>;
    await run(
      `INSERT OR REPLACE INTO weekly_signals (week_start, overall_status, risk_count, explanation)
       VALUES (?, ?, ?, ?)`,
      [data.week_start, data.overall_status, data.risk_count, data.explanation]
    );
  }

  async getRecentIndicators(type: 'gas' | 'cpi' | 'interest_rate' | 'unemployment', weeks: number = 4): Promise<IndicatorData[]> {
    await this.ensureInitialized();
    const all = promisify(this.db.all.bind(this.db)) as (sql: string, params?: any[]) => Promise<any[]>;
    const rows = await all(
      `SELECT * FROM indicators WHERE indicator_type = ? ORDER BY week_start DESC LIMIT ?`,
      [type, weeks]
    ) as IndicatorData[];
    return rows;
  }

  async getWeeklySignalsHistory(limit: number = 12): Promise<WeeklySignal[]> {
    await this.ensureInitialized();
    const all = promisify(this.db.all.bind(this.db)) as (sql: string, params?: any[]) => Promise<any[]>;
    const rows = await all(
      `SELECT * FROM weekly_signals ORDER BY week_start DESC LIMIT ?`,
      [limit]
    ) as WeeklySignal[];
    return rows;
  }

  async savePushSubscription(subscription: Omit<PushSubscription, 'id' | 'created_at'>): Promise<void> {
    await this.ensureInitialized();
    const run = promisify(this.db.run.bind(this.db)) as (sql: string, params?: any[]) => Promise<any>;
    await run(
      `INSERT OR REPLACE INTO push_subscriptions (endpoint, p256dh, auth, user_agent)
       VALUES (?, ?, ?, ?)`,
      [subscription.endpoint, subscription.p256dh, subscription.auth, subscription.user_agent]
    );
  }

  async getAllPushSubscriptions(): Promise<PushSubscription[]> {
    await this.ensureInitialized();
    const all = promisify(this.db.all.bind(this.db)) as (sql: string, params?: any[]) => Promise<any[]>;
    const rows = await all(
      `SELECT * FROM push_subscriptions`
    ) as PushSubscription[];
    return rows;
  }

  async deletePushSubscription(endpoint: string): Promise<void> {
    await this.ensureInitialized();
    const run = promisify(this.db.run.bind(this.db)) as (sql: string, params?: any[]) => Promise<any>;
    await run(
      `DELETE FROM push_subscriptions WHERE endpoint = ?`,
      [endpoint]
    );
  }

  // User and subscription methods
  async getUserById(userId: string): Promise<any | null> {
    await this.ensureInitialized();
    const get = promisify(this.db.get.bind(this.db)) as (sql: string, params?: any[]) => Promise<any>;
    const row = await get(`SELECT * FROM users WHERE id = ?`, [userId]);
    return row || null;
  }

  async getUserByEmail(email: string): Promise<any | null> {
    await this.ensureInitialized();
    const get = promisify(this.db.get.bind(this.db)) as (sql: string, params?: any[]) => Promise<any>;
    const row = await get(`SELECT * FROM users WHERE email = ?`, [email]);
    return row || null;
  }

  async createUser(user: { id: string; email: string; name?: string; emailVerified?: Date; password?: string }): Promise<void> {
    await this.ensureInitialized();
    const run = promisify(this.db.run.bind(this.db)) as (sql: string, params?: any[]) => Promise<any>;
    await run(
      `INSERT INTO users (id, email, name, emailVerified, password) VALUES (?, ?, ?, ?, ?)`,
      [user.id, user.email, user.name || null, user.emailVerified ? user.emailVerified.getTime() : null, user.password || null]
    );
  }

  async updateUser(userId: string, updates: { email?: string; name?: string; emailVerified?: Date }): Promise<void> {
    await this.ensureInitialized();
    const run = promisify(this.db.run.bind(this.db)) as (sql: string, params?: any[]) => Promise<any>;
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.email) {
      fields.push('email = ?');
      values.push(updates.email);
    }
    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.emailVerified !== undefined) {
      fields.push('emailVerified = ?');
      values.push(updates.emailVerified.getTime());
    }
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(userId);

    if (fields.length > 0) {
      await run(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    }
  }

  async getSubscriptionByUserId(userId: string): Promise<any | null> {
    await this.ensureInitialized();
    const get = promisify(this.db.get.bind(this.db)) as (sql: string, params?: any[]) => Promise<any>;
    const row = await get(
      `SELECT * FROM subscriptions WHERE user_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
    return row || null;
  }

  async getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<any | null> {
    await this.ensureInitialized();
    const get = promisify(this.db.get.bind(this.db)) as (sql: string, params?: any[]) => Promise<any>;
    const row = await get(
      `SELECT * FROM subscriptions WHERE stripe_subscription_id = ?`,
      [stripeSubscriptionId]
    );
    return row || null;
  }

  async saveSubscription(subscription: {
    id?: string;
    user_id: string;
    stripe_subscription_id: string;
    stripe_customer_id: string;
    status: string;
    plan: string;
    current_period_start: number;
    current_period_end: number;
    cancel_at_period_end?: boolean;
  }): Promise<void> {
    await this.ensureInitialized();
    const run = promisify(this.db.run.bind(this.db)) as (sql: string, params?: any[]) => Promise<any>;
    
    if (subscription.id) {
      // Update existing
      await run(
        `UPDATE subscriptions SET 
          stripe_subscription_id = ?,
          stripe_customer_id = ?,
          status = ?,
          plan = ?,
          current_period_start = ?,
          current_period_end = ?,
          cancel_at_period_end = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          subscription.stripe_subscription_id,
          subscription.stripe_customer_id,
          subscription.status,
          subscription.plan,
          subscription.current_period_start,
          subscription.current_period_end,
          subscription.cancel_at_period_end ? 1 : 0,
          subscription.id,
        ]
      );
    } else {
      // Insert new
      await run(
        `INSERT INTO subscriptions 
          (user_id, stripe_subscription_id, stripe_customer_id, status, plan, current_period_start, current_period_end, cancel_at_period_end)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          subscription.user_id,
          subscription.stripe_subscription_id,
          subscription.stripe_customer_id,
          subscription.status,
          subscription.plan,
          subscription.current_period_start,
          subscription.current_period_end,
          subscription.cancel_at_period_end ? 1 : 0,
        ]
      );
    }
  }

  close() {
    return new Promise<void>((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

// Singleton instance
let dbInstance: Database | null = null;

export function getDb(): Database {
  if (!dbInstance) {
    dbInstance = new Database();
  }
  return dbInstance;
}

