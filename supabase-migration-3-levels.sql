-- Migration: Add 'caution' status to indicators table
-- Run this in Supabase SQL Editor if you already have the database set up

-- Update the CHECK constraint to include 'caution'
ALTER TABLE indicators 
DROP CONSTRAINT IF EXISTS indicators_status_check;

ALTER TABLE indicators 
ADD CONSTRAINT indicators_status_check 
CHECK (status IN ('ok', 'caution', 'risk'));

-- Note: Existing data with 'ok' or 'risk' status will remain unchanged
-- New data can now use 'caution' status


