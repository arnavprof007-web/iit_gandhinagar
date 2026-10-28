import dotenv from 'dotenv';
import { query, withTransaction, closePool } from '../db/index.js';
import { hashPassword, normalizeEmail } from '../services/authService.js';
import { logAudit } from '../services/auditService.js';

dotenv.config();

export async function seedAdmin() {
  console.log('================================================================');
  console.log('       GreenPulse Mission LiFE — Administrator Bootstrap        ');
  console.log('================================================================');

  const name = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_INITIAL_PASSWORD;

  // 1. Verify required environment variables
  const missing = [];
  if (!name) missing.push('ADMIN_NAME');
  if (!email) missing.push('ADMIN_EMAIL');
  if (!password) missing.push('ADMIN_INITIAL_PASSWORD');

  if (missing.length > 0) {
    console.error(`\n[BOOTSTRAP FAILED]: Missing required environment variables: ${missing.join(', ')}`);
    console.error('Please configure these in your .env file before running seed:admin.\n');
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }

  // 2. Normalize and validate email
  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail.includes('@') || cleanEmail.length < 5) {
    console.error('\n[BOOTSTRAP FAILED]: Invalid email format provided in ADMIN_EMAIL.\n');
    throw new Error('Invalid ADMIN_EMAIL');
  }

  // 3. Validate password policy
  if (password.length < 8) {
    console.error('\n[BOOTSTRAP FAILED]: ADMIN_INITIAL_PASSWORD must be at least 8 characters long.\n');
    throw new Error('Password too short');
  }

  // 4. Check existing account
  const existingRes = await query('SELECT id, email, role, email_verified FROM users WHERE email = $1', [cleanEmail]);

  if (existingRes.rows.length > 0) {
    const existing = existingRes.rows[0];
    if (existing.role === 'admin') {
      console.log(`\n[BOOTSTRAP SKIPPED]: Administrator account for "${cleanEmail}" already exists.`);
      console.log('Existing credentials and permissions have been preserved without changes.\n');
      return { status: 'skipped', reason: 'already_exists', email: cleanEmail };
    } else {
      console.error(`\n[BOOTSTRAP BLOCKED]: An account with email "${cleanEmail}" already exists with role '${existing.role}'.`);
      console.error('Refusing automatic privilege escalation. Use manual administrative procedure if intended.\n');
      throw new Error('Existing account has non-admin role');
    }
  }

  // 5. Hash password and insert administrator
  const passwordHash = await hashPassword(password);

  const admin = await withTransaction(async (client) => {
    const insertRes = await client.query(
      `INSERT INTO users (
        full_name, email, password_hash, role, email_verified,
        must_change_password, is_active
      ) VALUES ($1, $2, $3, 'admin', TRUE, TRUE, TRUE)
      RETURNING id, full_name, email, role, email_verified, must_change_password, created_at;`,
      [name.trim(), cleanEmail, passwordHash]
    );

    const createdAdmin = insertRes.rows[0];

    await logAudit({
      userId: createdAdmin.id,
      action: 'ADMIN_BOOTSTRAP_SEEDED',
      entityType: 'user',
      entityId: createdAdmin.id,
      newValues: { full_name: createdAdmin.full_name, email: createdAdmin.email, role: 'admin' },
      client,
    });

    return createdAdmin;
  });

  console.log('\n[BOOTSTRAP SUCCESS]: Administrator account created successfully!');
  console.log(`• Name: ${admin.full_name}`);
  console.log(`• Email: ${admin.email}`);
  console.log(`• Role: ${admin.role}`);
  console.log('• Email Verified: Yes (Bootstrap bypass)');
  console.log('• Mandatory Password Change on First Login: ENFORCED');
  console.log('================================================================\n');

  return { status: 'created', admin };
}

// Direct execution from CLI
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  seedAdmin()
    .then(async () => {
      await closePool();
      process.exit(0);
    })
    .catch(async () => {
      await closePool();
      process.exit(1);
    });
}

export default seedAdmin;
