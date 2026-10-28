-- Migration: 005_create_footprint_and_emission_factors
-- Description: Creates tables for verified carbon footprint records and authoritative emission factors.

-- 1. Footprint Records Table
CREATE TABLE IF NOT EXISTS footprint_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    activity_inputs JSONB NOT NULL DEFAULT '{}'::jsonb,
    emissions_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    total_emissions_kg_co2e NUMERIC(12, 3) NOT NULL,
    calculation_method_version VARCHAR(50) NOT NULL DEFAULT 'v1.0-CEA-IPCC',
    emission_factor_source_version VARCHAR(50) NOT NULL DEFAULT 'CEA-CO2-Database-v20-IPCC-2006',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_footprint_period CHECK (period_end >= period_start),
    CONSTRAINT chk_footprint_total_emissions CHECK (total_emissions_kg_co2e >= 0)
);

-- Indexes for footprint_records
CREATE INDEX IF NOT EXISTS idx_footprint_user_period ON footprint_records (user_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_footprint_created_at ON footprint_records (created_at);

-- 2. Authoritative Emission Factors Table
CREATE TABLE IF NOT EXISTS emission_factors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(50) NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    factor_value NUMERIC(14, 6) NOT NULL,
    factor_unit VARCHAR(50) NOT NULL,
    geography VARCHAR(100) NOT NULL DEFAULT 'India-National',
    source_name VARCHAR(255) NOT NULL,
    source_url TEXT,
    publication_year INTEGER,
    valid_from DATE NOT NULL,
    valid_until DATE,
    accounting_boundary VARCHAR(100) NOT NULL DEFAULT 'Scope 2 / Scope 1',
    methodology_notes TEXT,
    verification_status VARCHAR(30) NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_factor_category CHECK (category IN ('electricity', 'transport', 'cooking', 'waste', 'water', 'lifestyle')),
    CONSTRAINT chk_factor_value CHECK (factor_value >= 0),
    CONSTRAINT chk_factor_publication_year CHECK (publication_year IS NULL OR publication_year BETWEEN 1990 AND 2100),
    CONSTRAINT chk_factor_validity_period CHECK (valid_until IS NULL OR valid_until >= valid_from),
    CONSTRAINT chk_factor_verification_status CHECK (verification_status IN ('draft', 'verified', 'deprecated'))
);

-- Indexes for emission_factors
CREATE INDEX IF NOT EXISTS idx_emission_factors_lookup ON emission_factors (category, activity_type, geography, valid_from);
CREATE INDEX IF NOT EXISTS idx_emission_factors_status ON emission_factors (verification_status);

DROP TRIGGER IF EXISTS trg_emission_factors_updated_at ON emission_factors;
CREATE TRIGGER trg_emission_factors_updated_at
BEFORE UPDATE ON emission_factors
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
