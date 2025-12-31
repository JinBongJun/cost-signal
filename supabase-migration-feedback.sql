-- Feedback table for user feedback, bug reports, and feature requests
CREATE TABLE IF NOT EXISTS feedback (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('bug', 'feature', 'general')),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  user_email TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'reviewed', 'resolved', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for filtering by status and date
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback(type);

