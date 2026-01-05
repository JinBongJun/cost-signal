-- Migration: Create user_spending_patterns table
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS user_spending_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- RLS Policy: Users can only view their own spending patterns
CREATE POLICY "Users can view own spending patterns"
  ON user_spending_patterns
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own spending patterns
CREATE POLICY "Users can insert own spending patterns"
  ON user_spending_patterns
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own spending patterns
CREATE POLICY "Users can update own spending patterns"
  ON user_spending_patterns
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own spending patterns
CREATE POLICY "Users can delete own spending patterns"
  ON user_spending_patterns
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_spending_patterns_updated_at
  BEFORE UPDATE ON user_spending_patterns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

