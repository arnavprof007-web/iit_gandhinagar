-- Migration: 007_challenge_lifecycle_and_versioning
-- Description: Updates challenge lifecycle statuses ('draft', 'published', 'closed', 'archived'),
-- adds versioning tracking, and captures historical participation snapshots.

-- 1. Update status constraint on challenges table
ALTER TABLE challenges DROP CONSTRAINT IF EXISTS chk_challenges_status;
ALTER TABLE challenges ADD CONSTRAINT chk_challenges_status 
  CHECK (status IN ('draft', 'published', 'closed', 'archived', 'active', 'completed'));

-- Map any existing 'active' to 'published'
UPDATE challenges SET status = 'published' WHERE status = 'active';

-- Add version and lifecycle timestamp columns to challenges
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;

-- 2. Add version and rules snapshot columns to challenge_participants for historical auditability
ALTER TABLE challenge_participants ADD COLUMN IF NOT EXISTS challenge_version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE challenge_participants ADD COLUMN IF NOT EXISTS rules_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE challenge_participants ADD COLUMN IF NOT EXISTS reward_points_snapshot INTEGER NOT NULL DEFAULT 0;

-- 3. Extend email_otps purpose check constraint to include 'email_change'
ALTER TABLE email_otps DROP CONSTRAINT IF EXISTS chk_otps_purpose;
ALTER TABLE email_otps ADD CONSTRAINT chk_otps_purpose 
  CHECK (purpose IN ('registration', 'login', 'password_reset', 'email_verification', 'email_change'));
