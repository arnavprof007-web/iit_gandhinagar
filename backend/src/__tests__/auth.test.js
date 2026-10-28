import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { closePool, query } from '../db/index.js';
import emailService from '../services/emailService.js';

describe('Phase 3 — Database-Backed Authentication API', () => {
  const app = createApp();
  const testEmail = `citizen_auth_${Date.now()}@example.com`;
  const testPassword = 'SecureCitizenPass2026!';
  let capturedOtp = null;
  let sessionCookie = null;

  beforeAll(async () => {
    // Clean any prior test artifacts scoped strictly to auth tests
    await query('DELETE FROM users WHERE email LIKE $1', ['citizen_auth_%@example.com']);
  });

  afterAll(async () => {
    await query('DELETE FROM users WHERE email LIKE $1', ['citizen_auth_%@example.com']);
  });

  it('POST /api/v1/auth/register should create an unverified user and dispatch an OTP', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Aarav Sharma',
        email: `  ${testEmail.toUpperCase()}  `, // Test email normalization (trim & lowercase)
        password: testPassword,
        city: 'Gandhinagar',
        state: 'Gujarat',
        role: 'admin', // Attack attempt: Public user must NOT be able to grant admin role!
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data.user).toHaveProperty('id');
    expect(res.body.data.user.email).toBe(testEmail.toLowerCase());
    expect(res.body.data.user.role).toBe('user'); // Privilege escalation strictly prevented
    expect(res.body.data.user.email_verified).toBe(false);
    expect(res.body.data.user).not.toHaveProperty('password_hash');
    expect(res.body.data.user).not.toHaveProperty('password');

    // Retrieve the active OTP dispatched in dev mode
    const lastMsg = emailService.getLastDevMessage();
    expect(lastMsg).toBeDefined();
    expect(lastMsg.type).toBe('otp');
    expect(lastMsg.to).toBe(testEmail.toLowerCase());
    expect(lastMsg.code).toMatch(/^\d{6}$/);
    capturedOtp = lastMsg.code;

    // Verify database storage: OTP must NOT be stored in plaintext!
    const dbOtp = await query('SELECT otp_hash FROM email_otps WHERE email = $1', [testEmail.toLowerCase()]);
    expect(dbOtp.rows.length).toBe(1);
    expect(dbOtp.rows[0].otp_hash).not.toBe(capturedOtp);
    expect(dbOtp.rows[0].otp_hash.startsWith('$2')).toBe(true); // Bcrypt hash
  });

  it('POST /api/v1/auth/register should reject duplicate registration', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Another Citizen',
        email: testEmail,
        password: testPassword,
      });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
  });

  it('POST /api/v1/auth/login should reject unverified accounts', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('EMAIL_NOT_VERIFIED');
  });

  it('POST /api/v1/auth/verify-email should reject invalid OTP codes and decrement remaining attempts', async () => {
    const res = await request(app)
      .post('/api/v1/auth/verify-email')
      .send({
        email: testEmail,
        otp: '000000',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_OTP');
    expect(res.body.error.message).toContain('attempt(s) remaining');
  });

  it('POST /api/v1/auth/verify-email should verify email with valid 6-digit OTP and consume it', async () => {
    const res = await request(app)
      .post('/api/v1/auth/verify-email')
      .send({
        email: testEmail,
        otp: capturedOtp,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify database updated
    const userDb = await query('SELECT email_verified FROM users WHERE email = $1', [testEmail.toLowerCase()]);
    expect(userDb.rows[0].email_verified).toBe(true);

    // Verify OTP consumed (single-use)
    const consumedRes = await request(app)
      .post('/api/v1/auth/verify-email')
      .send({
        email: testEmail,
        otp: capturedOtp,
      });
    expect(consumedRes.status).toBe(400); // Re-consumption rejected
  });

  it('POST /api/v1/auth/login should succeed for verified accounts and issue session cookie', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testEmail.toLowerCase());
    expect(res.body.data).toHaveProperty('sessionToken');

    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    const sessionCookieStr = cookies.find((c) => c.startsWith('greenpulse_session='));
    expect(sessionCookieStr).toBeDefined();
    expect(sessionCookieStr).toContain('HttpOnly');

    sessionCookie = sessionCookieStr.split(';')[0];
  });

  it('GET /api/v1/auth/me should return current user with valid session', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', sessionCookie);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(testEmail.toLowerCase());
    expect(res.body.data.user.role).toBe('user');
    expect(res.body.data.user).not.toHaveProperty('password_hash');
  });

  it('GET /api/v1/auth/me should reject unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('POST /api/v1/auth/logout should invalidate the session', async () => {
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Cookie', sessionCookie);

    expect(res.status).toBe(200);

    // Subsequent request with the same cookie must now be rejected
    const checkRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', sessionCookie);
    expect(checkRes.status).toBe(401);
  });

  it('Password recovery: forgot-password & reset-password flow', async () => {
    // 1. Request reset
    const forgotRes = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: testEmail });

    expect(forgotRes.status).toBe(200);
    expect(forgotRes.body.success).toBe(true);

    const devMsg = emailService.getLastDevMessage();
    expect(devMsg).toBeDefined();
    expect(devMsg.type).toBe('password_reset');
    const resetToken = devMsg.token;
    expect(resetToken).toBeDefined();

    // 2. Perform reset
    const newPassword = 'BrandNewPassword2026!';
    const resetRes = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({
        token: resetToken,
        newPassword,
      });

    expect(resetRes.status).toBe(200);
    expect(resetRes.body.success).toBe(true);

    // 3. Old password should fail
    const oldLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testEmail, password: testPassword });
    expect(oldLogin.status).toBe(401);

    // 4. New password succeeds
    const newLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testEmail, password: newPassword });
    expect(newLogin.status).toBe(200);
  });
});
