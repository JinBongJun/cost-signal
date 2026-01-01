-- Row Level Security (RLS) Migration for Cost Signal
-- This enables database-level security for user data
-- Run this in Supabase SQL Editor: Settings -> Database -> SQL Editor

-- Enable RLS on all user-related tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Note: push_subscriptions doesn't have user_id, so we'll handle it differently
-- indicators and weekly_signals are public data, no RLS needed

-- ============================================
-- USERS TABLE
-- ============================================
-- Users can only view and update their own data
CREATE POLICY "Users can view their own data"
ON users
FOR SELECT
USING (auth.uid()::text = id);

CREATE POLICY "Users can update their own data"
ON users
FOR UPDATE
USING (auth.uid()::text = id);

-- Service role can do everything (for server-side operations)
CREATE POLICY "Service role has full access to users"
ON users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- ACCOUNTS TABLE
-- ============================================
-- Users can only view their own OAuth accounts
CREATE POLICY "Users can view their own accounts"
ON accounts
FOR SELECT
USING (auth.uid()::text = user_id);

-- Service role has full access
CREATE POLICY "Service role has full access to accounts"
ON accounts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- SESSIONS TABLE
-- ============================================
-- Users can only view their own sessions
CREATE POLICY "Users can view their own sessions"
ON sessions
FOR SELECT
USING (auth.uid()::text = user_id);

-- Service role has full access
CREATE POLICY "Service role has full access to sessions"
ON sessions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
-- Users can only view and update their own subscriptions
CREATE POLICY "Users can view their own subscriptions"
ON subscriptions
FOR SELECT
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own subscriptions"
ON subscriptions
FOR UPDATE
USING (auth.uid()::text = user_id);

-- Service role has full access
CREATE POLICY "Service role has full access to subscriptions"
ON subscriptions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- FEEDBACK TABLE
-- ============================================
-- Users can only view their own feedback
-- Note: We use user_email to match since we're using NextAuth
-- This requires a helper function to get user email from auth
CREATE OR REPLACE FUNCTION get_user_email()
RETURNS TEXT AS $$
  SELECT email FROM users WHERE id = auth.uid()::text;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE POLICY "Users can view their own feedback"
ON feedback
FOR SELECT
USING (user_email = get_user_email());

-- Users can insert their own feedback
CREATE POLICY "Users can insert their own feedback"
ON feedback
FOR INSERT
WITH CHECK (user_email = get_user_email() OR user_email IS NULL);

-- Service role has full access
CREATE POLICY "Service role has full access to feedback"
ON feedback
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- PASSWORD_RESET_TOKENS TABLE
-- ============================================
-- Users can only view their own reset tokens
CREATE POLICY "Users can view their own reset tokens"
ON password_reset_tokens
FOR SELECT
USING (auth.uid()::text = user_id);

-- Service role has full access
CREATE POLICY "Service role has full access to password_reset_tokens"
ON password_reset_tokens
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- IMPORTANT NOTES
-- ============================================
-- 1. This RLS setup assumes you're using Supabase Auth
-- 2. If you're using NextAuth (which you are), you'll need to:
--    - Either migrate to Supabase Auth, OR
--    - Use service_role key for all database operations (current approach)
--    - RLS will still provide an extra security layer
-- 3. The service_role policies ensure your server-side code continues to work
-- 4. For client-side direct access, users would need to authenticate via Supabase Auth


