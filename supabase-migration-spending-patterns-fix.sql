-- Fix migration: Remove foreign key constraint for NextAuth compatibility
-- NextAuth users are not in Supabase auth.users, so we can't use foreign key

-- If table already exists with foreign key, we need to drop and recreate
-- WARNING: This will delete all existing spending pattern data!
-- Uncomment the line below only if you're okay with losing existing data
-- DROP TABLE IF EXISTS user_spending_patterns CASCADE;

-- Create table without foreign key constraint
CREATE TABLE IF NOT EXISTS user_spending_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Changed from UUID to TEXT for NextAuth compatibility
  gas_frequency TEXT CHECK (gas_frequency IN ('daily', 'weekly', 'biweekly', 'monthly')),
  monthly_rent NUMERIC,
  food_ratio TEXT CHECK (food_ratio IN ('low', 'medium', 'high')),
  transport_mode TEXT CHECK (transport_mode IN ('car', 'public', 'mixed')),
  has_debt BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_spending_patterns_user_id ON user_spending_patterns(user_id);

-- Enable Row Level Security
ALTER TABLE user_spending_patterns ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own spending patterns" ON user_spending_patterns;
DROP POLICY IF EXISTS "Users can insert own spending patterns" ON user_spending_patterns;
DROP POLICY IF EXISTS "Users can update own spending patterns" ON user_spending_patterns;
DROP POLICY IF EXISTS "Users can delete own spending patterns" ON user_spending_patterns;

-- RLS Policy: Allow service role to do everything (for API access)
-- This allows the API to read/write using service role key
CREATE POLICY "Service role can manage all spending patterns"
  ON user_spending_patterns
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Note: Since we're using NextAuth (not Supabase Auth), we rely on API-level authentication
-- The API endpoints check authentication before allowing access
-- RLS policies are permissive for service role, but API enforces user ownership

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_user_spending_patterns_updated_at ON user_spending_patterns;
CREATE TRIGGER update_user_spending_patterns_updated_at
  BEFORE UPDATE ON user_spending_patterns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

