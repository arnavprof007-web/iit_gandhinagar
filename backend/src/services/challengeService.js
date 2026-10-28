import { query, withTransaction } from '../db/index.js';
import { logAudit } from './auditService.js';

export const VALID_CATEGORIES = new Set([
  'energy',
  'water',
  'waste',
  'mobility',
  'lifestyle',
  'solar',
  'consumption',
]);

export const VALID_PROOF_TYPES = new Set([
  'electricity_bill',
  'transport_ticket',
  'photo_evidence',
  'solar_generation_log',
  'self_attestation',
]);

export const VALID_STATUSES = new Set([
  'draft',
  'published',
  'closed',
  'archived',
]);

/**
 * Validate verification rules JSON structure safely (no eval or arbitrary code)
 */
export function validateVerificationRules(rules) {
  if (!rules || typeof rules !== 'object' || Array.isArray(rules)) {
    return { valid: true, rules: {} };
  }

  const safe = {};
  if (typeof rules.photoRequired === 'boolean') safe.photoRequired = rules.photoRequired;
  if (typeof rules.beforeAfterRequired === 'boolean') safe.beforeAfterRequired = rules.beforeAfterRequired;
  if (typeof rules.numericMin === 'number') safe.numericMin = rules.numericMin;
  if (typeof rules.numericMax === 'number') safe.numericMax = rules.numericMax;
  if (typeof rules.unit === 'string') safe.unit = rules.unit.trim().slice(0, 30);
  if (Array.isArray(rules.requiredFields)) {
    safe.requiredFields = rules.requiredFields.filter((f) => typeof f === 'string' && f.length < 50);
  }

  return { valid: true, rules: safe };
}

/**
 * Create a new challenge (draft by default)
 */
export async function createChallenge(data, adminUser, { ipAddress = null } = {}) {
  const {
    title,
    description,
    category,
    instructions = [],
    startDate,
    endDate,
    targetType = 'action',
    targetValue = 1,
    targetUnit = 'action',
    proofType = 'photo_evidence',
    verificationRules = {},
    pointsReward = 50,
    maxSubmissionsPerUser = 1,
    status = 'draft',
  } = data;

  if (!title || !description || !category || !startDate || !endDate) {
    const err = new Error('Title, description, category, startDate, and endDate are required.');
    err.status = 400;
    throw err;
  }

  if (!VALID_CATEGORIES.has(category)) {
    const err = new Error(`Invalid category. Allowed: ${Array.from(VALID_CATEGORIES).join(', ')}`);
    err.status = 400;
    throw err;
  }

  if (new Date(endDate) < new Date(startDate)) {
    const err = new Error('Challenge endDate must not precede startDate.');
    err.status = 400;
    throw err;
  }

  const { rules: safeRules } = validateVerificationRules(verificationRules);

  const res = await withTransaction(async (client) => {
    const insertRes = await client.query(
      `INSERT INTO challenges (
        title, description, category, instructions, start_date, end_date,
        target_type, target_value, target_unit, proof_type, verification_rules,
        points_reward, max_submissions_per_user, status, version, created_by,
        published_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 1, $15,
        $16
      ) RETURNING *;`,
      [
        title.trim(),
        description.trim(),
        category,
        Array.isArray(instructions) ? instructions : [instructions],
        startDate,
        endDate,
        targetType,
        Number(targetValue),
        targetUnit,
        proofType,
        JSON.stringify(safeRules),
        Number(pointsReward),
        Number(maxSubmissionsPerUser),
        status,
        adminUser.id,
        status === 'published' ? new Date() : null,
      ]
    );

    const created = insertRes.rows[0];

    await logAudit({
      userId: adminUser.id,
      action: 'CHALLENGE_CREATED',
      entityType: 'challenge',
      entityId: created.id,
      newValues: created,
      ipAddress,
      client,
    });

    return created;
  });

  return res;
}

/**
 * Edit challenge with versioning and audit log
 */
export async function editChallenge(id, updates, adminUser, { ipAddress = null } = {}) {
  const currentRes = await query('SELECT * FROM challenges WHERE id = $1', [id]);
  if (currentRes.rows.length === 0) {
    const err = new Error('Challenge not found.');
    err.status = 404;
    throw err;
  }

  const current = currentRes.rows[0];

  if (current.status === 'archived') {
    const err = new Error('Archived challenges cannot be modified.');
    err.status = 400;
    throw err;
  }

  // If already published, editing creates a new version number to preserve snapshot integrity
  const newVersion = current.status === 'published' ? current.version + 1 : current.version;

  const newTitle = updates.title !== undefined ? updates.title.trim() : current.title;
  const newDescription = updates.description !== undefined ? updates.description.trim() : current.description;
  const newCategory = updates.category !== undefined ? updates.category : current.category;
  const newInstructions = updates.instructions !== undefined ? updates.instructions : current.instructions;
  const newStartDate = updates.startDate !== undefined ? updates.startDate : current.start_date;
  const newEndDate = updates.endDate !== undefined ? updates.endDate : current.end_date;
  const newPoints = updates.pointsReward !== undefined ? Number(updates.pointsReward) : current.points_reward;
  const newRules = updates.verificationRules !== undefined ? updates.verificationRules : current.verification_rules;

  if (new Date(newEndDate) < new Date(newStartDate)) {
    const err = new Error('End date must not precede start date.');
    err.status = 400;
    throw err;
  }

  const { rules: safeRules } = validateVerificationRules(newRules);

  const updated = await withTransaction(async (client) => {
    const updateRes = await client.query(
      `UPDATE challenges SET
        title = $1, description = $2, category = $3, instructions = $4,
        start_date = $5, end_date = $6, points_reward = $7, verification_rules = $8,
        version = $9, updated_at = NOW()
       WHERE id = $10
       RETURNING *;`,
      [
        newTitle,
        newDescription,
        newCategory,
        Array.isArray(newInstructions) ? newInstructions : [newInstructions],
        newStartDate,
        newEndDate,
        newPoints,
        JSON.stringify(safeRules),
        newVersion,
        id,
      ]
    );

    const result = updateRes.rows[0];

    await logAudit({
      userId: adminUser.id,
      action: 'CHALLENGE_UPDATED',
      entityType: 'challenge',
      entityId: id,
      oldValues: current,
      newValues: result,
      ipAddress,
      client,
    });

    return result;
  });

  return updated;
}

/**
 * Change challenge lifecycle status (publish, close, archive)
 */
export async function transitionChallengeStatus(id, newStatus, adminUser, { ipAddress = null } = {}) {
  const currentRes = await query('SELECT * FROM challenges WHERE id = $1', [id]);
  if (currentRes.rows.length === 0) {
    const err = new Error('Challenge not found.');
    err.status = 404;
    throw err;
  }

  const current = currentRes.rows[0];

  // Enforce permitted state transitions
  const validTransitions = {
    draft: ['published', 'archived'],
    published: ['closed', 'archived'],
    closed: ['archived', 'published'],
    archived: [], // Terminal state
  };

  const allowed = validTransitions[current.status] || [];
  if (!allowed.includes(newStatus)) {
    const err = new Error(`Cannot transition challenge from '${current.status}' to '${newStatus}'.`);
    err.status = 400;
    throw err;
  }

  // Publication prerequisite validation
  if (newStatus === 'published') {
    if (!current.title || !current.description || !current.start_date || !current.end_date) {
      const err = new Error('Challenge is incomplete and cannot be published.');
      err.status = 400;
      throw err;
    }
  }

  const updated = await withTransaction(async (client) => {
    const updateRes = await client.query(
      `UPDATE challenges SET
        status = $1::varchar,
        published_at = CASE WHEN $1::varchar = 'published' AND published_at IS NULL THEN NOW() ELSE published_at END,
        closed_at = CASE WHEN $1::varchar = 'closed' THEN NOW() ELSE closed_at END,
        updated_at = NOW()
       WHERE id = $2
       RETURNING *;`,
      [newStatus, id]
    );

    const result = updateRes.rows[0];

    await logAudit({
      userId: adminUser.id,
      action: `CHALLENGE_${newStatus.toUpperCase()}`,
      entityType: 'challenge',
      entityId: id,
      oldValues: { status: current.status },
      newValues: { status: newStatus },
      ipAddress,
      client,
    });

    return result;
  });

  return updated;
}

/**
 * Public challenge list (only 'published' challenges discoverable by citizens)
 */
export async function getPublicChallenges({
  category = null,
  search = null,
  limit = 20,
  offset = 0,
  userId = null,
} = {}) {
  const conditions = ["c.status = 'published'"];
  const params = [];

  if (category && VALID_CATEGORIES.has(category)) {
    params.push(category);
    conditions.push(`c.category = $${params.length}`);
  }

  if (search && typeof search === 'string' && search.trim()) {
    params.push(`%${search.trim().toLowerCase()}%`);
    conditions.push(`(LOWER(c.title) LIKE $${params.length} OR LOWER(c.description) LIKE $${params.length})`);
  }

  const whereClause = conditions.join(' AND ');

  params.push(Math.min(100, Math.max(1, parseInt(limit, 10))));
  const limitIdx = params.length;
  params.push(Math.max(0, parseInt(offset, 10)));
  const offsetIdx = params.length;

  let userJoinSelect = 'FALSE AS is_joined, NULL AS user_participant_status';
  let userJoinClause = '';
  if (userId) {
    params.push(userId);
    const userIdx = params.length;
    userJoinSelect = `(cp.id IS NOT NULL) AS is_joined, cp.status AS user_participant_status, cp.joined_at AS user_joined_at`;
    userJoinClause = `LEFT JOIN challenge_participants cp ON c.id = cp.challenge_id AND cp.user_id = $${userIdx}`;
  }

  const sql = `
    SELECT 
      c.id, c.title, c.description, c.category, c.instructions,
      c.start_date, c.end_date, c.target_type, c.target_value, c.target_unit,
      c.proof_type, c.points_reward, c.status, c.version, c.created_at,
      ${userJoinSelect},
      (SELECT count(*)::int FROM challenge_participants WHERE challenge_id = c.id) AS participants_count
    FROM challenges c
    ${userJoinClause}
    WHERE ${whereClause}
    ORDER BY c.start_date DESC, c.created_at DESC
    LIMIT $${limitIdx} OFFSET $${offsetIdx};
  `;

  const countSql = `SELECT count(*)::int AS total FROM challenges c WHERE ${whereClause};`;
  const countParams = conditions.length > 1 ? params.slice(0, conditions.length - 1) : [];

  const [listRes, countRes] = await Promise.all([
    query(sql, params),
    query(countSql, countParams),
  ]);

  return {
    challenges: listRes.rows,
    total: countRes.rows[0].total,
    limit: parseInt(limit, 10),
    offset: parseInt(offset, 10),
  };
}

/**
 * Public challenge details by ID
 */
export async function getChallengeById(id, userId = null) {
  let userJoinSelect = 'FALSE AS is_joined, NULL AS user_participant_status';
  let userJoinClause = '';
  const params = [id];

  if (userId) {
    params.push(userId);
    userJoinSelect = `(cp.id IS NOT NULL) AS is_joined, cp.status AS user_participant_status, cp.joined_at AS user_joined_at`;
    userJoinClause = `LEFT JOIN challenge_participants cp ON c.id = cp.challenge_id AND cp.user_id = $2`;
  }

  const sql = `
    SELECT 
      c.id, c.title, c.description, c.category, c.instructions,
      c.start_date, c.end_date, c.target_type, c.target_value, c.target_unit,
      c.proof_type, c.verification_rules, c.points_reward, c.status, c.version,
      c.created_at, c.updated_at,
      ${userJoinSelect},
      (SELECT count(*)::int FROM challenge_participants WHERE challenge_id = c.id) AS participants_count
    FROM challenges c
    ${userJoinClause}
    WHERE c.id = $1;
  `;

  const res = await query(sql, params);
  if (res.rows.length === 0) return null;

  return res.rows[0];
}

/**
 * Join a challenge with strict duplicate enrollment protection and snapshot preservation
 * NOTE: Joining a challenge NEVER awards points!
 */
export async function joinChallenge(challengeId, userId) {
  // 1. Fetch challenge details
  const chalRes = await query('SELECT * FROM challenges WHERE id = $1', [challengeId]);
  if (chalRes.rows.length === 0) {
    const err = new Error('Challenge not found.');
    err.status = 404;
    throw err;
  }

  const challenge = chalRes.rows[0];

  // 2. Lifecycle check: Only published challenges can be joined
  if (challenge.status !== 'published') {
    const err = new Error(`Cannot join a challenge with status '${challenge.status}'.`);
    err.status = 400;
    err.code = 'CHALLENGE_NOT_PUBLISHED';
    throw err;
  }

  // 3. Date window check
  const today = new Date().toISOString().split('T')[0];
  const chalStart = new Date(challenge.start_date).toISOString().split('T')[0];
  const chalEnd = new Date(challenge.end_date).toISOString().split('T')[0];

  if (today < chalStart) {
    const err = new Error(`This challenge has not started yet. Starts on ${chalStart}.`);
    err.status = 400;
    err.code = 'CHALLENGE_NOT_STARTED';
    throw err;
  }

  if (today > chalEnd) {
    const err = new Error(`This challenge closed on ${chalEnd}.`);
    err.status = 400;
    err.code = 'CHALLENGE_CLOSED';
    throw err;
  }

  // 4. Enroll with database uniqueness constraint & snapshot capture
  try {
    const insertRes = await query(
      `INSERT INTO challenge_participants (
        challenge_id, user_id, status, challenge_version,
        rules_snapshot, reward_points_snapshot
      ) VALUES ($1, $2, 'enrolled', $3, $4, $5)
      RETURNING *;`,
      [
        challengeId,
        userId,
        challenge.version,
        challenge.verification_rules || {},
        challenge.points_reward,
      ]
    );

    return {
      success: true,
      participant: insertRes.rows[0],
      message: `Successfully enrolled in "${challenge.title}". Action logged (0 points awarded on join).`,
    };
  } catch (dbErr) {
    // Unique violation (PostgreSQL code 23505)
    if (dbErr.code === '23505' || dbErr.message.includes('uq_challenge_participant')) {
      const err = new Error('You are already enrolled in this challenge.');
      err.status = 409;
      err.code = 'DUPLICATE_ENROLLMENT';
      throw err;
    }
    throw dbErr;
  }
}

/**
 * Get personal participation history for current authenticated user
 */
export async function getUserParticipations(userId, { limit = 20, offset = 0 } = {}) {
  const params = [userId, Math.min(100, Math.max(1, parseInt(limit, 10))), Math.max(0, parseInt(offset, 10))];

  const sql = `
    SELECT 
      cp.id AS participation_id,
      cp.joined_at,
      cp.status AS participation_status,
      cp.challenge_version,
      cp.reward_points_snapshot,
      c.id AS challenge_id,
      c.title,
      c.category,
      c.target_type,
      c.target_value,
      c.target_unit,
      c.proof_type,
      c.start_date,
      c.end_date,
      c.status AS current_challenge_status
    FROM challenge_participants cp
    JOIN challenges c ON cp.challenge_id = c.id
    WHERE cp.user_id = $1
    ORDER BY cp.joined_at DESC
    LIMIT $2 OFFSET $3;
  `;

  const countSql = `SELECT count(*)::int AS total FROM challenge_participants WHERE user_id = $1;`;

  const [listRes, countRes] = await Promise.all([
    query(sql, params),
    query(countSql, [userId]),
  ]);

  return {
    participations: listRes.rows,
    total: countRes.rows[0].total,
    limit: parseInt(limit, 10),
    offset: parseInt(offset, 10),
  };
}

/**
 * Admin: Get all challenges including draft and archived
 */
export async function getAdminChallenges({
  category = null,
  status = null,
  search = null,
  limit = 20,
  offset = 0,
} = {}) {
  const conditions = [];
  const params = [];

  if (status && VALID_STATUSES.has(status)) {
    params.push(status);
    conditions.push(`c.status = $${params.length}`);
  }

  if (category && VALID_CATEGORIES.has(category)) {
    params.push(category);
    conditions.push(`c.category = $${params.length}`);
  }

  if (search && typeof search === 'string' && search.trim()) {
    params.push(`%${search.trim().toLowerCase()}%`);
    conditions.push(`(LOWER(c.title) LIKE $${params.length} OR LOWER(c.description) LIKE $${params.length})`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  params.push(Math.min(100, Math.max(1, parseInt(limit, 10))));
  const limitIdx = params.length;
  params.push(Math.max(0, parseInt(offset, 10)));
  const offsetIdx = params.length;

  const sql = `
    SELECT 
      c.*,
      u.full_name AS creator_name,
      u.email AS creator_email,
      (SELECT count(*)::int FROM challenge_participants WHERE challenge_id = c.id) AS participants_count
    FROM challenges c
    LEFT JOIN users u ON c.created_by = u.id
    ${whereClause}
    ORDER BY c.created_at DESC
    LIMIT $${limitIdx} OFFSET $${offsetIdx};
  `;

  const countSql = `SELECT count(*)::int AS total FROM challenges c ${whereClause};`;
  const countParams = conditions.length > 0 ? params.slice(0, conditions.length) : [];

  const [listRes, countRes] = await Promise.all([
    query(sql, params),
    query(countSql, countParams),
  ]);

  return {
    challenges: listRes.rows,
    total: countRes.rows[0].total,
    limit: parseInt(limit, 10),
    offset: parseInt(offset, 10),
  };
}

/**
 * Admin: Aggregate statistics
 */
export async function getAdminChallengeStats() {
  const statsRes = await query(`
    SELECT 
      count(*)::int AS total,
      count(*) FILTER (WHERE status = 'draft')::int AS draft_count,
      count(*) FILTER (WHERE status = 'published')::int AS published_count,
      count(*) FILTER (WHERE status = 'closed')::int AS closed_count,
      count(*) FILTER (WHERE status = 'archived')::int AS archived_count
    FROM challenges;
  `);

  const participantsRes = await query('SELECT count(*)::int AS total_enrollments FROM challenge_participants;');

  return {
    ...statsRes.rows[0],
    total_enrollments: participantsRes.rows[0].total_enrollments,
  };
}

export default {
  createChallenge,
  editChallenge,
  transitionChallengeStatus,
  getPublicChallenges,
  getChallengeById,
  joinChallenge,
  getUserParticipations,
  getAdminChallenges,
  getAdminChallengeStats,
  validateVerificationRules,
};
