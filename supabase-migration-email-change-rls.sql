-- Row Level Security (RLS) for email_change_tokens table
-- Run this AFTER creating the email_change_tokens table

-- Enable RLS on email_change_tokens table
ALTER TABLE email_change_tokens ENABLE ROW LEVEL SECURITY;

-- Service role has full access (for server-side operations)
CREATE POLICY "Service role has full access to email_change_tokens"
ON email_change_tokens
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users cannot directly access their own tokens (server-side only)
-- This is intentional - tokens should only be accessed via API endpoints

