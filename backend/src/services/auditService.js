import { query as defaultQuery } from '../db/index.js';

// Sensitive keys that must NEVER be written to audit logs
const REDACTED_KEYS = new Set([
  'password',
  'password_hash',
  'passwordHash',
  'otp',
  'otp_hash',
  'otpHash',
  'token',
  'token_hash',
  'tokenHash',
  'authorization',
  'secret',
  'session_secret',
]);

/**
 * Sanitize an object or JSON payload before writing to audit log
 */
export function sanitizeAuditData(data) {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(sanitizeAuditData);

  const clean = {};
  for (const [key, val] of Object.entries(data)) {
    if (REDACTED_KEYS.has(key.toLowerCase())) {
      clean[key] = '[REDACTED]';
    } else if (val && typeof val === 'object') {
      clean[key] = sanitizeAuditData(val);
    } else {
      clean[key] = val;
    }
  }
  return clean;
}

/**
 * Record an administrative audit entry in PostgreSQL
 * @param {Object} params
 * @param {string|null} params.userId - Actor user ID
 * @param {string} params.action - e.g. 'CHALLENGE_CREATED', 'USER_DEACTIVATED'
 * @param {string} params.entityType - e.g. 'challenge', 'user', 'session'
 * @param {string} params.entityId - ID of target entity
 * @param {Object|null} params.oldValues - Previous state before mutation
 * @param {Object|null} params.newValues - New state after mutation
 * @param {string|null} params.ipAddress - Client IP address
 * @param {Object} [params.client] - Optional active database client for transactions
 */
export async function logAudit({
  userId = null,
  action,
  entityType,
  entityId = null,
  oldValues = null,
  newValues = null,
  ipAddress = null,
  client = null,
}) {
  const sanitizedOld = oldValues ? JSON.stringify(sanitizeAuditData(oldValues)) : null;
  const sanitizedNew = newValues ? JSON.stringify(sanitizeAuditData(newValues)) : null;

  const sql = `
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, ip_address)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, action, entity_type, entity_id, created_at;
  `;
  const params = [userId, action, entityType, entityId, sanitizedOld, sanitizedNew, ipAddress];

  try {
    if (client) {
      return await client.query(sql, params);
    }
    return await defaultQuery(sql, params);
  } catch (err) {
    console.error('[AuditService Error]: Failed to persist audit log', err.message);
    // Don't crash main request if audit logging fails outside critical transaction
    return null;
  }
}

/**
 * Get paginated audit logs for administrators
 */
export async function getAuditLogs({ limit = 50, offset = 0, action = null, entityType = null } = {}) {
  const conditions = [];
  const params = [];

  if (action) {
    params.push(action);
    conditions.push(`action = $${params.length}`);
  }
  if (entityType) {
    params.push(entityType);
    conditions.push(`entity_type = $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  params.push(limit);
  const limitIndex = params.length;
  params.push(offset);
  const offsetIndex = params.length;

  const logsQuery = `
    SELECT 
      a.id,
      a.user_id,
      u.full_name AS actor_name,
      u.email AS actor_email,
      a.action,
      a.entity_type,
      a.entity_id,
      a.old_values,
      a.new_values,
      a.ip_address,
      a.created_at
    FROM audit_logs a
    LEFT JOIN users u ON a.user_id = u.id
    ${whereClause}
    ORDER BY a.created_at DESC
    LIMIT $${limitIndex} OFFSET $${offsetIndex};
  `;

  const countQuery = `SELECT count(*) AS total FROM audit_logs ${whereClause};`;
  const countParams = conditions.length > 0 ? params.slice(0, conditions.length) : [];

  const [logsRes, countRes] = await Promise.all([
    defaultQuery(logsQuery, params),
    defaultQuery(countQuery, countParams),
  ]);

  return {
    logs: logsRes.rows,
    total: parseInt(countRes.rows[0].total, 10),
    limit,
    offset,
  };
}

export default {
  logAudit,
  getAuditLogs,
  sanitizeAuditData,
};
