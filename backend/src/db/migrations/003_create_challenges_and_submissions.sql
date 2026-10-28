-- Migration: 003_create_challenges_and_submissions
-- Description: Creates challenges, participant tracking, and evidence submissions with verification lifecycle.

-- 1. Challenges Table
CREATE TABLE IF NOT EXISTS challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    instructions TEXT[] NOT NULL DEFAULT '{}',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_value NUMERIC(12, 2) NOT NULL,
    target_unit VARCHAR(50) NOT NULL,
    proof_type VARCHAR(50) NOT NULL,
    verification_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
    points_reward INTEGER NOT NULL,
    max_submissions_per_user INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_challenges_category CHECK (category IN ('energy', 'water', 'waste', 'mobility', 'lifestyle', 'solar', 'consumption')),
    CONSTRAINT chk_challenges_dates CHECK (end_date >= start_date),
    CONSTRAINT chk_challenges_target_value CHECK (target_value > 0),
    CONSTRAINT chk_challenges_proof_type CHECK (proof_type IN ('electricity_bill', 'transport_ticket', 'photo_evidence', 'solar_generation_log', 'self_attestation')),
    CONSTRAINT chk_challenges_points CHECK (points_reward >= 0),
    CONSTRAINT chk_challenges_max_sub CHECK (max_submissions_per_user > 0),
    CONSTRAINT chk_challenges_status CHECK (status IN ('draft', 'active', 'archived', 'completed'))
);

-- Indexes for challenges
CREATE INDEX IF NOT EXISTS idx_challenges_category ON challenges (category);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges (status);
CREATE INDEX IF NOT EXISTS idx_challenges_dates ON challenges (start_date, end_date);

DROP TRIGGER IF EXISTS trg_challenges_updated_at ON challenges;
CREATE TRIGGER trg_challenges_updated_at
BEFORE UPDATE ON challenges
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Challenge Participants Table
CREATE TABLE IF NOT EXISTS challenge_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(20) NOT NULL DEFAULT 'enrolled',

    -- Constraints
    CONSTRAINT chk_participant_status CHECK (status IN ('enrolled', 'completed', 'abandoned')),
    CONSTRAINT uq_challenge_participant UNIQUE (challenge_id, user_id)
);

-- Indexes for challenge_participants
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user ON challenge_participants (user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge ON challenge_participants (challenge_id);

-- 3. Submissions Table
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    submitted_value NUMERIC(12, 2),
    submitted_unit VARCHAR(50),
    proof_storage_key VARCHAR(500),
    proof_file_hash VARCHAR(64),
    extracted_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    recognition_engine VARCHAR(100),
    recognition_engine_version VARCHAR(50),
    verification_status VARCHAR(30) NOT NULL DEFAULT 'pending',
    verification_reason TEXT,
    points_awarded INTEGER NOT NULL DEFAULT 0,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    review_reason TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_submitted_value CHECK (submitted_value IS NULL OR submitted_value >= 0),
    CONSTRAINT chk_verification_status CHECK (verification_status IN ('pending', 'processing', 'approved', 'rejected', 'needs_resubmission', 'flagged', 'failed')),
    CONSTRAINT chk_points_awarded CHECK (points_awarded >= 0)
);

-- Indexes for submissions
CREATE INDEX IF NOT EXISTS idx_submissions_challenge_user ON submissions (challenge_id, user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions (verification_status);
CREATE INDEX IF NOT EXISTS idx_submissions_user_status ON submissions (user_id, verification_status);
CREATE INDEX IF NOT EXISTS idx_submissions_file_hash ON submissions (proof_file_hash) WHERE proof_file_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions (submitted_at);

DROP TRIGGER IF EXISTS trg_submissions_updated_at ON submissions;
CREATE TRIGGER trg_submissions_updated_at
BEFORE UPDATE ON submissions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
