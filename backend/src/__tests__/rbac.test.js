import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { closePool, query } from '../db/index.js';
import { hashPassword } from '../services/authService.js';

describe('Phase 4 — Role-Based Access Control, Profiles & Audit Logs', () => {
  const app = createApp();

  const citizenEmail = `citizen_rbac_${Date.now()}@example.com`;
  const adminEmail = `admin_rbac_${Date.now()}@example.com`;
  const citizenPassword = 'CitizenSecurePass2026!';
  const initialAdminPass = 'InitialAdminPass2026!';
  const newAdminPass = 'NewStrongAdminPass2026!';

  let citizenCookie = null;
  let adminCookie = null;
  let adminUserId = null;

  beforeAll(async () => {
    // 1. Create a verified citizen user
    const citizenHash = await hashPassword(citizenPassword);
    const citRes = await query(
      `INSERT INTO users (full_name, email, password_hash, role, email_verified, must_change_password, is_active)
       VALUES ('Regular Citizen', $1, $2, 'user', TRUE, FALSE, TRUE)
       RETURNING id;`,
      [citizenEmail, citizenHash]
    );

    // 2. Create an admin user with mandatory first-login password change
    const adminHash = await hashPassword(initialAdminPass);
    const admRes = await query(
      `INSERT INTO users (full_name, email, password_hash, role, email_verified, must_change_password, is_active)
       VALUES ('System Admin', $1, $2, 'admin', TRUE, TRUE, TRUE)
       RETURNING id;`,
      [adminEmail, adminHash]
    );
    adminUserId = admRes.rows[0].id;

    // Login citizen
    const citLogin = await request(app).post('/api/v1/auth/login').send({ email: citizenEmail, password: citizenPassword });
    citizenCookie = citLogin.headers['set-cookie'].find((c) => c.startsWith('greenpulse_session=')).split(';')[0];

    // Login admin
    const admLogin = await request(app).post('/api/v1/auth/login').send({ email: adminEmail, password: initialAdminPass });
    adminCookie = admLogin.headers['set-cookie'].find((c) => c.startsWith('greenpulse_session=')).split(';')[0];
  });

  afterAll(async () => {
    await query('DELETE FROM users WHERE email IN ($1, $2)', [citizenEmail, adminEmail]);
  });

  it('Citizen accessing admin endpoints should be rejected with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/v1/admin/challenges/stats')
      .set('Cookie', citizenCookie);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
    expect(res.body.error.message).toContain('Administrator privileges required');
  });

  it('Admin with must_change_password=true should be blocked from protected admin features with 403', async () => {
    const res = await request(app)
      .get('/api/v1/admin/challenges/stats')
      .set('Cookie', adminCookie);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('PASSWORD_CHANGE_REQUIRED');
  });

  it('Admin can access /api/v1/auth/change-password and fulfill first-login requirement', async () => {
    // 1. Change password
    const res = await request(app)
      .post('/api/v1/auth/change-password')
      .set('Cookie', adminCookie)
      .send({
        currentPassword: initialAdminPass,
        newPassword: newAdminPass,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify database flag cleared
    const dbUser = await query('SELECT must_change_password FROM users WHERE id = $1', [adminUserId]);
    expect(dbUser.rows[0].must_change_password).toBe(false);

    // 2. Now admin can access protected admin features
    const statsRes = await request(app)
      .get('/api/v1/admin/challenges/stats')
      .set('Cookie', adminCookie);

    expect(statsRes.status).toBe(200);
    expect(statsRes.body.success).toBe(true);
    expect(statsRes.body.data).toHaveProperty('total');
  });

  it('User profile: GET /api/v1/users/me returns authenticated citizen data', async () => {
    const res = await request(app)
      .get('/api/v1/users/me')
      .set('Cookie', citizenCookie);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(citizenEmail);
    expect(res.body.data.user.role).toBe('user');
    expect(res.body.data.user).not.toHaveProperty('password_hash');
  });

  it('User profile: PATCH /api/v1/users/me updates allowlisted fields and ignores protected fields', async () => {
    const res = await request(app)
      .patch('/api/v1/users/me')
      .set('Cookie', citizenCookie)
      .send({
        city: 'Ahmedabad',
        householdSize: 5,
        role: 'admin', // Malicious attempt to self-promote to admin
        is_active: false,
        email_verified: false,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.user.city).toBe('Ahmedabad');
    expect(res.body.data.user.household_size).toBe(5);
    expect(res.body.data.user.role).toBe('user'); // Protected field was not modified

    // Verify in database
    const dbUser = await query('SELECT role, email_verified FROM users WHERE email = $1', [citizenEmail]);
    expect(dbUser.rows[0].role).toBe('user');
  });

  it('Audit logging: Admin actions are recorded in PostgreSQL audit_logs without secrets', async () => {
    const auditRes = await request(app)
      .get('/api/v1/admin/audit-logs')
      .set('Cookie', adminCookie);

    expect(auditRes.status).toBe(200);
    expect(auditRes.body.success).toBe(true);
    expect(auditRes.body.data.logs.length).toBeGreaterThan(0);

    // Check that password fields are NOT logged
    for (const log of auditRes.body.data.logs) {
      const logStr = JSON.stringify(log);
      expect(logStr).not.toContain(citizenPassword);
      expect(logStr).not.toContain(newAdminPass);
    }
  });
});
