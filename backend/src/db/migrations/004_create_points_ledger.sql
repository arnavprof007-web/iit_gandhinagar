-- Migration: 004_create_points_ledger
-- Description: Creates the immutable points transaction ledger with duplicate reward prevention.

CREATE TABLE IF NOT EXISTS points_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES challenges(id) ON DELETE SET NULL,
    submission_id UUID REFERENCES submissions(id) ON DELETE SET NULL,
    points INTEGER NOT NULL,
    reason VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_points_nonzero CHECK (points != 0)
);

-- Strict duplicate prevention: A submission can only award positive points ONCE per user
CREATE UNIQUE INDEX IF NOT EXISTS uq_points_ledger_submission_award 
ON points_ledger (user_id, submission_id) 
WHERE (submission_id IS NOT NULL AND points > 0);

-- Query optimization indexes
CREATE INDEX IF NOT EXISTS idx_points_ledger_user ON points_ledger (user_id);
CREATE INDEX IF NOT EXISTS idx_points_ledger_challenge ON points_ledger (challenge_id);
CREATE INDEX IF NOT EXISTS idx_points_ledger_created_at ON points_ledger (created_at);
