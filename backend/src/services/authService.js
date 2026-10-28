import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import config from '../config/env.js';
import { query, withTransaction } from '../db/index.js';
import emailService from './emailService.js';
import { logAudit } from './auditService.js';

const SALT_ROUNDS = 10;

/**
 * Hash password with bcrypt
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare password with bcrypt hash
 */
export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a cryptographically secure 6-digit decimal string
 */
export function generateSixDigitOtp() {
  const number = crypto.randomInt(100000, 1000000);
  return number.toString();
}

/**
 * Hash an OTP for secure storage
 */
export async function hashOtp(otp) {
  return bcrypt.hash(otp, 8);
}

/**
 * Verify submitted OTP against bcrypt hash
 */
export async function verifyOtpHash(otp, hash) {
  return bcrypt.compare(otp, hash);
}

/**
 * SHA-256 hash helper for session and reset tokens
 */
export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Normalize email string consistently
 */
export function normalizeEmail(email) {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

/**
 * Sanitize user object for public API responses
 */
export function sanitizeUser(user) {
  if (!user) return null;
  const {
    password_hash,
    passwordHash,
    otp_hash,
    otpHash,
    ...safeUser
  } = user;
  return safeUser;
}

/**
 * Register a new citizen account
 */
export async function registerUser({
  fullName,
  email,
  password,
  city = null,
  state = null,
  householdSize = null,
  dietType = null,
  primaryTransportMode = null,
  phoneNumber = null,
  ageGroup = null,
}) {
  const cleanEmail = normalizeEmail(email);

  // 1. Check if user already exists
  const existingRes = await query('SELECT id, email, email_verified FROM users WHERE email = $1', [cleanEmail]);
  if (existingRes.rows.length > 0) {
    const error = new Error('An account with this email address already exists.');
    error.status = 409;
    error.code = 'EMAIL_ALREADY_EXISTS';
    throw error;
  }

  // 2. Hash password securely
  const passwordHash = await hashPassword(password);

  // 3. Generate 6-digit OTP and hash it
  const otpCode = generateSixDigitOtp();
  const otpHash = await hashOtp(otpCode);
  const otpExpiresAt = new Date(Date.now() + config.otpLifetimeMinutes * 60 * 1000);

  // 4. Create user and OTP atomically in a transaction
  const result = await withTransaction(async (client) => {
    // Insert user strictly as 'user' role with unverified email
    const userRes = await client.query(
      `INSERT INTO users (
        full_name, email, password_hash, role, email_verified,
        city, state, household_size, diet_type, primary_transport_mode,
        phone_number, age_group, must_change_password, is_active
      ) VALUES ($1, $2, $3, 'user', FALSE, $4, $5, $6, $7, $8, $9, $10, FALSE, TRUE)
      RETURNING id, full_name, email, role, email_verified, city, state, created_at;`,
      [
        fullName.trim(),
        cleanEmail,
        passwordHash,
        city,
        state,
        householdSize,
        dietType,
        primaryTransportMode,
        phoneNumber,
        ageGroup,
      ]
    );

    const newUser = userRes.rows[0];

    // Invalidate any older OTPs for this email
    await client.query(
      `UPDATE email_otps SET consumed_at = NOW() 
       WHERE email = $1 AND purpose = 'registration' AND consumed_at IS NULL`,
      [cleanEmail]
    );

    // Insert new OTP record
    await client.query(
      `INSERT INTO email_otps (user_id, email, otp_hash, purpose, expires_at)
       VALUES ($1, $2, $3, 'registration', $4);`,
      [newUser.id, cleanEmail, otpHash, otpExpiresAt]
    );

    return newUser;
  });

  // 5. Send verification email via email service
  const emailRes = await emailService.sendOtpEmail(cleanEmail, otpCode, 'registration');

  return {
    user: sanitizeUser(result),
    emailDelivery: emailRes.success,
    message: emailRes.success
      ? 'Account created. Please check your email for the 6-digit verification code.'
      : 'Account created, but email delivery encountered an issue. You may request an OTP resend.',
  };
}

/**
 * Verify email address with 6-digit OTP
 */
export async function verifyEmail(email, otp) {
  const cleanEmail = normalizeEmail(email);

  if (!otp || otp.length !== 6) {
    const err = new Error('Verification code must be 6 digits.');
    err.status = 400;
    err.code = 'INVALID_OTP_FORMAT';
    throw err;
  }

  // Retrieve active OTP record for registration or verification
  const otpRes = await query(
    `SELECT id, user_id, email, otp_hash, attempt_count, expires_at 
     FROM email_otps 
     WHERE email = $1 AND purpose IN ('registration', 'email_verification') AND consumed_at IS NULL
     ORDER BY created_at DESC 
     LIMIT 1`,
    [cleanEmail]
  );

  if (otpRes.rows.length === 0) {
    const err = new Error('No active verification code found for this email. Please request a new code.');
    err.status = 400;
    err.code = 'OTP_NOT_FOUND';
    throw err;
  }

  const record = otpRes.rows[0];

  // Check failed attempt limits
  if (record.attempt_count >= config.otpMaxAttempts) {
    const err = new Error('Too many failed attempts. This code has been invalidated. Please request a new code.');
    err.status = 429;
    err.code = 'MAX_ATTEMPTS_EXCEEDED';
    throw err;
  }

  // Check expiry
  if (new Date() > new Date(record.expires_at)) {
    const err = new Error('This verification code has expired. Please request a new code.');
    err.status = 400;
    err.code = 'OTP_EXPIRED';
    throw err;
  }

  // Validate submitted code
  const isMatch = await verifyOtpHash(otp, record.otp_hash);
  if (!isMatch) {
    // Safely increment attempt count
    await query('UPDATE email_otps SET attempt_count = attempt_count + 1 WHERE id = $1', [record.id]);
    const remaining = config.otpMaxAttempts - (record.attempt_count + 1);
    const err = new Error(`Invalid verification code. ${Math.max(0, remaining)} attempt(s) remaining.`);
    err.status = 400;
    err.code = 'INVALID_OTP';
    throw err;
  }

  // Consume OTP and verify user in transaction
  await withTransaction(async (client) => {
    await client.query('UPDATE email_otps SET consumed_at = NOW() WHERE id = $1', [record.id]);
    await client.query('UPDATE users SET email_verified = TRUE, updated_at = NOW() WHERE email = $1', [cleanEmail]);
  });

  return {
    success: true,
    message: 'Email verified successfully! You may now sign in to GreenPulse.',
  };
}

/**
 * Resend a new OTP with rate-limiting and cooldown enforcement
 */
export async function resendOtp(email, purpose = 'registration') {
  const cleanEmail = normalizeEmail(email);

  // Check cooldown on recent OTP requests
  const recentRes = await query(
    `SELECT created_at FROM email_otps 
     WHERE email = $1 AND purpose = $2 
     ORDER BY created_at DESC LIMIT 1`,
    [cleanEmail, purpose]
  );

  if (recentRes.rows.length > 0) {
    const secondsSinceLast = (Date.now() - new Date(recentRes.rows[0].created_at).getTime()) / 1000;
    if (secondsSinceLast < config.otpResendCooldownSeconds) {
      const waitRemaining = Math.ceil(config.otpResendCooldownSeconds - secondsSinceLast);
      const err = new Error(`Please wait ${waitRemaining} second(s) before requesting a new code.`);
      err.status = 429;
      err.code = 'RESEND_COOLDOWN_ACTIVE';
      throw err;
    }
  }

  // Find user (to prevent leaking, return success even if user not found)
  const userRes = await query('SELECT id, email_verified FROM users WHERE email = $1', [cleanEmail]);
  if (userRes.rows.length === 0) {
    return {
      success: true,
      message: 'If this email is registered, a new verification code has been dispatched.',
    };
  }

  const user = userRes.rows[0];
  if (user.email_verified && purpose === 'registration') {
    return {
      success: true,
      message: 'Your email address is already verified. You can log in.',
    };
  }

  // Generate new OTP
  const otpCode = generateSixDigitOtp();
  const otpHash = await hashOtp(otpCode);
  const expiresAt = new Date(Date.now() + config.otpLifetimeMinutes * 60 * 1000);

  await withTransaction(async (client) => {
    // Invalidate older outstanding OTPs
    await client.query(
      `UPDATE email_otps SET consumed_at = NOW() 
       WHERE email = $1 AND purpose = $2 AND consumed_at IS NULL`,
      [cleanEmail, purpose]
    );

    await client.query(
      `INSERT INTO email_otps (user_id, email, otp_hash, purpose, expires_at)
       VALUES ($1, $2, $3, $4, $5);`,
      [user.id, cleanEmail, otpHash, purpose, expiresAt]
    );
  });

  await emailService.sendOtpEmail(cleanEmail, otpCode, purpose);

  return {
    success: true,
    message: 'A new 6-digit verification code has been dispatched to your email.',
  };
}

/**
 * Authenticate citizen or administrator credentials and issue a session
 */
export async function loginUser(email, password, { ipAddress = null, userAgent = null } = {}) {
  const cleanEmail = normalizeEmail(email);

  // 1. Query user by normalized email
  const userRes = await query(
    `SELECT id, full_name, email, password_hash, role, email_verified, is_active, 
            must_change_password, city, state, household_size, diet_type, 
            primary_transport_mode, created_at 
     FROM users WHERE email = $1`,
    [cleanEmail]
  );

  if (userRes.rows.length === 0) {
    const err = new Error('Invalid email or password.');
    err.status = 401;
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }

  const user = userRes.rows[0];

  // 2. Verify password
  const isPasswordValid = await verifyPassword(password, user.password_hash);
  if (!isPasswordValid) {
    const err = new Error('Invalid email or password.');
    err.status = 401;
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }

  // 3. Reject unverified accounts
  if (!user.email_verified) {
    const err = new Error('Please verify your email address before signing in.');
    err.status = 403;
    err.code = 'EMAIL_NOT_VERIFIED';
    throw err;
  }

  // 4. Reject inactive accounts
  if (!user.is_active) {
    const err = new Error('This account has been deactivated. Please contact an administrator.');
    err.status = 403;
    err.code = 'ACCOUNT_DEACTIVATED';
    throw err;
  }

  // 5. Create secure session in PostgreSQL
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(sessionToken);
  const expiresAt = new Date(Date.now() + config.sessionExpiryDays * 24 * 60 * 60 * 1000);

  await query(
    `INSERT INTO auth_sessions (user_id, token_hash, expires_at, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5);`,
    [user.id, tokenHash, expiresAt, ipAddress, userAgent]
  );

  return {
    sessionToken,
    user: sanitizeUser(user),
  };
}

/**
 * Invalidate a session on logout
 */
export async function logoutUser(sessionToken) {
  if (!sessionToken) return;
  const tokenHash = hashToken(sessionToken);
  await query('UPDATE auth_sessions SET revoked_at = NOW() WHERE token_hash = $1', [tokenHash]);
}

/**
 * Validate session token and retrieve authenticated user
 */
export async function getSessionUser(sessionToken) {
  if (!sessionToken) return null;
  const tokenHash = hashToken(sessionToken);

  const res = await query(
    `SELECT u.id, u.full_name, u.email, u.role, u.email_verified, u.is_active, 
            u.must_change_password, u.city, u.state, u.household_size, u.diet_type, 
            u.primary_transport_mode, u.created_at, s.expires_at, s.id AS session_id
     FROM auth_sessions s
     JOIN users u ON s.user_id = u.id
     WHERE s.token_hash = $1 AND s.revoked_at IS NULL AND s.expires_at > NOW();`,
    [tokenHash]
  );

  if (res.rows.length === 0) return null;

  const row = res.rows[0];
  if (!row.is_active) return null;

  return sanitizeUser(row);
}

/**
 * Request password recovery email
 */
export async function requestPasswordReset(email) {
  const cleanEmail = normalizeEmail(email);

  const userRes = await query('SELECT id, is_active FROM users WHERE email = $1', [cleanEmail]);
  if (userRes.rows.length === 0 || !userRes.rows[0].is_active) {
    // Generic response to avoid leaking account existence
    return {
      success: true,
      message: 'If an account exists with this email, a password reset link has been dispatched.',
    };
  }

  const user = userRes.rows[0];
  const resetToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(resetToken);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

  await withTransaction(async (client) => {
    // Invalidate existing outstanding reset tokens
    await client.query(
      `UPDATE email_otps SET consumed_at = NOW() 
       WHERE email = $1 AND purpose = 'password_reset' AND consumed_at IS NULL`,
      [cleanEmail]
    );

    await client.query(
      `INSERT INTO email_otps (user_id, email, otp_hash, purpose, expires_at)
       VALUES ($1, $2, $3, 'password_reset', $4);`,
      [user.id, cleanEmail, tokenHash, expiresAt]
    );
  });

  await emailService.sendPasswordResetEmail(cleanEmail, resetToken);

  return {
    success: true,
    message: 'If an account exists with this email, a password reset link has been dispatched.',
  };
}

/**
 * Reset password using high-entropy token
 */
export async function resetPassword({ token, newPassword }) {
  if (!token || !newPassword) {
    const err = new Error('Token and new password are required.');
    err.status = 400;
    throw err;
  }

  const tokenHash = hashToken(token);

  const otpRes = await query(
    `SELECT id, user_id, email, expires_at 
     FROM email_otps 
     WHERE otp_hash = $1 AND purpose = 'password_reset' AND consumed_at IS NULL
     ORDER BY created_at DESC LIMIT 1`,
    [tokenHash]
  );

  if (otpRes.rows.length === 0 || new Date() > new Date(otpRes.rows[0].expires_at)) {
    const err = new Error('This password reset link is invalid or has expired.');
    err.status = 400;
    err.code = 'INVALID_RESET_TOKEN';
    throw err;
  }

  const record = otpRes.rows[0];
  const newHash = await hashPassword(newPassword);

  await withTransaction(async (client) => {
    // Update user password and remove mandatory password change flag
    await client.query(
      `UPDATE users SET password_hash = $1, must_change_password = FALSE, updated_at = NOW() 
       WHERE id = $2`,
      [newHash, record.user_id]
    );

    // Consume the token
    await client.query('UPDATE email_otps SET consumed_at = NOW() WHERE id = $1', [record.id]);

    // Revoke all active sessions for this user
    await client.query('UPDATE auth_sessions SET revoked_at = NOW() WHERE user_id = $1', [record.user_id]);
  });

  return {
    success: true,
    message: 'Your password has been reset successfully. Please log in with your new credentials.',
  };
}

/**
 * Change password for authenticated user (mandatory first-login or voluntary)
 */
export async function changePassword(userId, currentPassword, newPassword, { ipAddress = null } = {}) {
  const userRes = await query('SELECT password_hash, must_change_password FROM users WHERE id = $1', [userId]);
  if (userRes.rows.length === 0) {
    const err = new Error('User not found.');
    err.status = 404;
    throw err;
  }

  const user = userRes.rows[0];
  const isValid = await verifyPassword(currentPassword, user.password_hash);
  if (!isValid) {
    const err = new Error('Current password is incorrect.');
    err.status = 400;
    err.code = 'INVALID_CURRENT_PASSWORD';
    throw err;
  }

  const isSame = await verifyPassword(newPassword, user.password_hash);
  if (isSame) {
    const err = new Error('New password must be different from current password.');
    err.status = 400;
    err.code = 'SAME_PASSWORD';
    throw err;
  }

  const newHash = await hashPassword(newPassword);

  await withTransaction(async (client) => {
    await client.query(
      `UPDATE users SET password_hash = $1, must_change_password = FALSE, updated_at = NOW() 
       WHERE id = $2`,
      [newHash, userId]
    );

    await logAudit({
      userId,
      action: 'PASSWORD_CHANGED',
      entityType: 'user',
      entityId: userId,
      ipAddress,
      client,
    });
  });

  return {
    success: true,
    message: 'Password updated successfully.',
  };
}

export default {
  registerUser,
  verifyEmail,
  resendOtp,
  loginUser,
  logoutUser,
  getSessionUser,
  requestPasswordReset,
  resetPassword,
  changePassword,
  hashPassword,
  verifyPassword,
  normalizeEmail,
  sanitizeUser,
};
