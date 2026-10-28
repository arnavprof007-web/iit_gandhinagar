import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATIONS_DIR = path.join(__dirname, '..', 'db', 'migrations');

describe('PostgreSQL Migration Files & Schema Definitions', () => {
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  it('should have all sequential migration files', () => {
    expect(files.length).toBeGreaterThanOrEqual(6);
    expect(files[0]).toContain('001_create_schema_migrations');
    expect(files[1]).toContain('002_create_users_and_auth');
    expect(files[2]).toContain('003_create_challenges_and_submissions');
    expect(files[3]).toContain('004_create_points_ledger');
    expect(files[4]).toContain('005_create_footprint_and_emission_factors');
    expect(files[5]).toContain('006_create_audit_logs');
    if (files.length > 6) {
      expect(files[6]).toContain('007_challenge_lifecycle_and_versioning');
    }
  });

  it('should define all 10 required domain tables across migrations', () => {
    const combinedSql = files
      .map((f) => fs.readFileSync(path.join(MIGRATIONS_DIR, f), 'utf8'))
      .join('\n');

    const requiredTables = [
      'users',
      'email_otps',
      'auth_sessions',
      'challenges',
      'challenge_participants',
      'submissions',
      'points_ledger',
      'footprint_records',
      'emission_factors',
      'audit_logs',
    ];

    for (const table of requiredTables) {
      const regex = new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`, 'i');
      expect(combinedSql).toMatch(regex);
    }
  });

  it('should enforce role check constraint restricting to "user" and "admin"', () => {
    const usersSql = fs.readFileSync(path.join(MIGRATIONS_DIR, '002_create_users_and_auth.sql'), 'utf8');
    expect(usersSql).toContain("role IN ('user', 'admin')");
    expect(usersSql).toContain("email = LOWER(TRIM(email))");
  });

  it('should enforce unique constraint on challenge_participants (challenge_id, user_id)', () => {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, '003_create_challenges_and_submissions.sql'), 'utf8');
    expect(sql).toContain("CONSTRAINT uq_challenge_participant UNIQUE (challenge_id, user_id)");
  });

  it('should enforce verification_status lifecycle on submissions', () => {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, '003_create_challenges_and_submissions.sql'), 'utf8');
    expect(sql).toContain("pending");
    expect(sql).toContain("processing");
    expect(sql).toContain("approved");
    expect(sql).toContain("rejected");
    expect(sql).toContain("needs_resubmission");
    expect(sql).toContain("flagged");
    expect(sql).toContain("failed");
  });

  it('should enforce duplicate point reward prevention on points_ledger', () => {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, '004_create_points_ledger.sql'), 'utf8');
    expect(sql).toContain("uq_points_ledger_submission_award");
    expect(sql).toContain("WHERE (submission_id IS NOT NULL AND points > 0)");
  });

  it('should use high precision numeric types for emission factors and footprints', () => {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, '005_create_footprint_and_emission_factors.sql'), 'utf8');
    expect(sql).toContain("factor_value NUMERIC(14, 6)");
    expect(sql).toContain("total_emissions_kg_co2e NUMERIC(12, 3)");
  });
});
