import { query, withTransaction } from '../db/index.js';
import { sanitizeUser, normalizeEmail, generateSixDigitOtp, hashOtp } from './authService.js';
import emailService from './emailService.js';
import config from '../config/env.js';
import { logAudit } from './auditService.js';

// Approved allowlist fields for citizen profile modification
const ALLOWED_PROFILE_FIELDS = new Set([
  'full_name',
  'phone_number',
  'age_group',
  'city',
  'state',
  'household_size',
  'diet_type',
  'primary_transport_mode',
]);

/**
 * Get profile for authenticated user
 */
export async function getProfile(userId) {
  const res = await query('SELECT * FROM users WHERE id = $1', [userId]);
  if (res.rows.length === 0) return null;
  return sanitizeUser(res.rows[0]);
}

/**
 * Update authenticated user's profile with field-level allowlist
 */
export async function updateProfile(userId, updates, { ipAddress = null } = {}) {
  const currentRes = await query('SELECT * FROM users WHERE id = $1', [userId]);
  if (currentRes.rows.length === 0) {
    const err = new Error('User not found.');
    err.status = 404;
    throw err;
  }

  const current = currentRes.rows[0];
  const setClauses = [];
  const params = [];
  const changedFields = {};

  for (const [key, value] of Object.entries(updates)) {
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    if (ALLOWED_PROFILE_FIELDS.has(snakeKey)) {
      params.push(value);
      setClauses.push(`${snakeKey} = $${params.length}`);
      changedFields[snakeKey] = value;
    }
  }

  if (setClauses.length === 0) {
    return sanitizeUser(current);
  }

  params.push(userId);
  const sql = `
    UPDATE users 
    SET ${setClauses.join(', ')}, updated_at = NOW() 
    WHERE id = $${params.length}
    RETURNING *;
  `;

  const updatedRes = await query(sql, params);
  const updatedUser = sanitizeUser(updatedRes.rows[0]);

  // Record audit log for profile mutation
  await logAudit({
    userId,
    action: 'PROFILE_UPDATED',
    entityType: 'user',
    entityId: userId,
    oldValues: current,
    newValues: changedFields,
    ipAddress,
  });

  return updatedUser;
}

/**
 * Initiate Email Change (Sends OTP to new email address)
 */
export async function requestEmailChange(userId, newEmail) {
  const cleanEmail = normalizeEmail(newEmail);

  if (!cleanEmail || !cleanEmail.includes('@')) {
    const err = new Error('Please provide a valid new email address.');
    err.status = 400;
    throw err;
  }

  // Check if new email already belongs to an existing user
  const existRes = await query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
  if (existRes.rows.length > 0) {
    const err = new Error('An account with this email address already exists.');
    err.status = 409;
    throw err;
  }

  const otpCode = generateSixDigitOtp();
  const otpHash = await hashOtp(otpCode);
  const expiresAt = new Date(Date.now() + config.otpLifetimeMinutes * 60 * 1000);

  await withTransaction(async (client) => {
    // Invalidate prior email_change OTPs for this user
    await client.query(
      `UPDATE email_otps SET consumed_at = NOW() 
       WHERE user_id = $1 AND purpose = 'email_change' AND consumed_at IS NULL`,
      [userId]
    );

    await client.query(
      `INSERT INTO email_otps (user_id, email, otp_hash, purpose, expires_at)
       VALUES ($1, $2, $3, 'email_change', $4);`,
      [userId, cleanEmail, otpHash, expiresAt]
    );
  });

  await emailService.sendOtpEmail(cleanEmail, otpCode, 'email_change');

  return {
    success: true,
    message: `Verification code sent to ${cleanEmail}. Please enter the 6-digit code to complete the update.`,
  };
}

/**
 * Confirm Email Change with OTP
 */
export async function confirmEmailChange(userId, newEmail, otp, { ipAddress = null } = {}) {
  const cleanEmail = normalizeEmail(newEmail);

  const otpRes = await query(
    `SELECT id, otp_hash, expires_at, attempt_count 
     FROM email_otps 
     WHERE user_id = $1 AND email = $2 AND purpose = 'email_change' AND consumed_at IS NULL
     ORDER BY created_at DESC LIMIT 1`,
    [userId, cleanEmail]
  );

  if (otpRes.rows.length === 0 || new Date() > new Date(otpRes.rows[0].expires_at)) {
    const err = new Error('Invalid or expired email change verification code.');
    err.status = 400;
    throw err;
  }

  const record = otpRes.rows[0];
  const { verifyOtpHash } = await import('./authService.js');
  const isMatch = await verifyOtpHash(otp, record.otp_hash);

  if (!isMatch) {
    await query('UPDATE email_otps SET attempt_count = attempt_count + 1 WHERE id = $1', [record.id]);
    const err = new Error('Invalid verification code.');
    err.status = 400;
    throw err;
  }

  const user = await withTransaction(async (client) => {
    await client.query('UPDATE email_otps SET consumed_at = NOW() WHERE id = $1', [record.id]);
    const updateRes = await client.query(
      'UPDATE users SET email = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [cleanEmail, userId]
    );

    await logAudit({
      userId,
      action: 'EMAIL_CHANGED',
      entityType: 'user',
      entityId: userId,
      newValues: { email: cleanEmail },
      ipAddress,
      client,
    });

    return sanitizeUser(updateRes.rows[0]);
  });

  return {
    success: true,
    user,
    message: 'Email address updated successfully.',
  };
}

export default {
  getProfile,
  updateProfile,
  requestEmailChange,
  confirmEmailChange,
};
