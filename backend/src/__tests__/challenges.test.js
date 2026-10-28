import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { closePool, query } from '../db/index.js';
import { hashPassword } from '../services/authService.js';

describe('Phase 5 — Challenge Management & Citizen Participation API', () => {
  const app = createApp();

  const citizenEmail = `citizen_chal_${Date.now()}@example.com`;
  const adminEmail = `admin_chal_${Date.now()}@example.com`;
  const pass = 'TestPass1234!';

  let citizenCookie = null;
  let adminCookie = null;
  let citizenUserId = null;
  let testChallengeId = null;

  beforeAll(async () => {
    const passwordHash = await hashPassword(pass);

    const citRes = await query(
      `INSERT INTO users (full_name, email, password_hash, role, email_verified, must_change_password, is_active)
       VALUES ('Eco Citizen', $1, $2, 'user', TRUE, FALSE, TRUE)
       RETURNING id;`,
      [citizenEmail, passwordHash]
    );
    citizenUserId = citRes.rows[0].id;

    await query(
      `INSERT INTO users (full_name, email, password_hash, role, email_verified, must_change_password, is_active)
       VALUES ('Challenge Admin', $1, $2, 'admin', TRUE, FALSE, TRUE);`,
      [adminEmail, passwordHash]
    );

    const citLogin = await request(app).post('/api/v1/auth/login').send({ email: citizenEmail, password: pass });
    citizenCookie = citLogin.headers['set-cookie'].find((c) => c.startsWith('greenpulse_session=')).split(';')[0];

    const admLogin = await request(app).post('/api/v1/auth/login').send({ email: adminEmail, password: pass });
    adminCookie = admLogin.headers['set-cookie'].find((c) => c.startsWith('greenpulse_session=')).split(';')[0];
  });

  afterAll(async () => {
    await query('DELETE FROM users WHERE email IN ($1, $2)', [citizenEmail, adminEmail]);
    if (testChallengeId) {
      await query('DELETE FROM challenges WHERE id = $1', [testChallengeId]);
    }
  });

  it('Admin can create a draft challenge; regular citizen receives 403', async () => {
    // 1. Citizen attempt rejected
    const citAttempt = await request(app)
      .post('/api/v1/admin/challenges')
      .set('Cookie', citizenCookie)
      .send({
        title: 'Unauthorized Challenge',
        description: 'Should fail',
        category: 'energy',
        startDate: '2026-10-01',
        endDate: '2026-10-31',
        targetValue: 1,
        targetUnit: 'trip',
        proofType: 'photo_evidence',
        pointsReward: 50,
      });
    expect(citAttempt.status).toBe(403);

    // 2. Admin creates draft challenge
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const res = await request(app)
      .post('/api/v1/admin/challenges')
      .set('Cookie', adminCookie)
      .send({
        title: 'Metro Commute Week',
        description: 'Take metro instead of petrol car for at least 3 days.',
        category: 'mobility',
        instructions: ['Board Gandhinagar-Ahmedabad metro', 'Save ticket receipt'],
        startDate: today,
        endDate: nextMonth,
        targetType: 'trips',
        targetValue: 3,
        targetUnit: 'trips',
        proofType: 'transport_ticket',
        pointsReward: 75,
        verificationRules: { photoRequired: true },
        status: 'draft',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.challenge.status).toBe('draft');
    expect(res.body.data.challenge.version).toBe(1);
    testChallengeId = res.body.data.challenge.id;
  });

  it('Draft challenges must NOT be visible to public browsing', async () => {
    const res = await request(app).get('/api/v1/challenges');
    expect(res.status).toBe(200);
    const found = res.body.data.challenges.find((c) => c.id === testChallengeId);
    expect(found).toBeUndefined(); // Draft is strictly hidden from public
  });

  it('Admin can publish the challenge; it then becomes publicly visible', async () => {
    const pubRes = await request(app)
      .post(`/api/v1/admin/challenges/${testChallengeId}/publish`)
      .set('Cookie', adminCookie);

    expect(pubRes.status).toBe(200);
    expect(pubRes.body.data.challenge.status).toBe('published');

    // Now public endpoint returns it
    const pubListRes = await request(app).get('/api/v1/challenges');
    expect(pubListRes.status).toBe(200);
    const found = pubListRes.body.data.challenges.find((c) => c.id === testChallengeId);
    expect(found).toBeDefined();
    expect(found.title).toBe('Metro Commute Week');
  });

  it('Citizen can enroll in the published challenge; NO points awarded on join', async () => {
    const joinRes = await request(app)
      .post(`/api/v1/challenges/${testChallengeId}/join`)
      .set('Cookie', citizenCookie);

    expect(joinRes.status).toBe(201);
    expect(joinRes.body.success).toBe(true);
    expect(joinRes.body.data.status).toBe('enrolled');
    expect(joinRes.body.data.challenge_version).toBe(1);

    // Verify database points ledger: JOINING A CHALLENGE NEVER AWARDS POINTS!
    const ledgerRes = await query('SELECT count(*)::int AS cnt FROM points_ledger WHERE user_id = $1', [citizenUserId]);
    expect(ledgerRes.rows[0].cnt).toBe(0); // 0 points awarded
  });

  it('Duplicate challenge enrollment must be rejected with 409 Conflict', async () => {
    const duplicateRes = await request(app)
      .post(`/api/v1/challenges/${testChallengeId}/join`)
      .set('Cookie', citizenCookie);

    expect(duplicateRes.status).toBe(409);
    expect(duplicateRes.body.error.code).toBe('DUPLICATE_ENROLLMENT');
  });

  it('GET /api/v1/challenges/my/participations returns user personal participation history', async () => {
    const res = await request(app)
      .get('/api/v1/challenges/my/participations')
      .set('Cookie', citizenCookie);

    expect(res.status).toBe(200);
    expect(res.body.data.participations.length).toBeGreaterThan(0);
    const record = res.body.data.participations.find((p) => p.challenge_id === testChallengeId);
    expect(record).toBeDefined();
    expect(record.title).toBe('Metro Commute Week');
    expect(record.challenge_version).toBe(1);
  });

  it('Admin editing published challenge increments version and preserves historical participation snapshot', async () => {
    const editRes = await request(app)
      .patch(`/api/v1/admin/challenges/${testChallengeId}`)
      .set('Cookie', adminCookie)
      .send({
        pointsReward: 120, // Increased reward for future joiners
      });

    expect(editRes.status).toBe(200);
    expect(editRes.body.data.challenge.version).toBe(2);
    expect(editRes.body.data.challenge.points_reward).toBe(120);

    // Verify existing citizen participant's historical snapshot remains protected at 75 points
    const partDb = await query(
      'SELECT challenge_version, reward_points_snapshot FROM challenge_participants WHERE challenge_id = $1 AND user_id = $2',
      [testChallengeId, citizenUserId]
    );
    expect(partDb.rows[0].challenge_version).toBe(1);
    expect(partDb.rows[0].reward_points_snapshot).toBe(75); // Preserved!
  });

  it('Admin closes challenge; new enrollments are rejected', async () => {
    const closeRes = await request(app)
      .post(`/api/v1/admin/challenges/${testChallengeId}/close`)
      .set('Cookie', adminCookie);

    expect(closeRes.status).toBe(200);
    expect(closeRes.body.data.challenge.status).toBe('closed');

    // Create a 2nd citizen
    const secondEmail = `citizen_two_${Date.now()}@example.com`;
    const passwordHash = await hashPassword(pass);
    await query(
      `INSERT INTO users (full_name, email, password_hash, role, email_verified, is_active)
       VALUES ('Second Citizen', $1, $2, 'user', TRUE, TRUE);`,
      [secondEmail, passwordHash]
    );

    const loginRes = await request(app).post('/api/v1/auth/login').send({ email: secondEmail, password: pass });
    const secondCookie = loginRes.headers['set-cookie'].find((c) => c.startsWith('greenpulse_session=')).split(';')[0];

    // Attempt to join closed challenge
    const failJoin = await request(app)
      .post(`/api/v1/challenges/${testChallengeId}/join`)
      .set('Cookie', secondCookie);

    expect(failJoin.status).toBe(400);
    expect(failJoin.body.error.code).toBe('CHALLENGE_NOT_PUBLISHED');

    await query('DELETE FROM users WHERE email = $1', [secondEmail]);
  });
});
