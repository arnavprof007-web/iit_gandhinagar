import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { getClient, closePool } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

/**
 * Calculate SHA-256 checksum of a file
 * @param {string} content
 * @returns {string}
 */
function getChecksum(content) {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

/**
 * Run pending PostgreSQL migrations
 * @returns {Promise<{appliedCount: number, totalCount: number, migrations: Array}>}
 */
export async function runMigrations() {
  console.log('================================================================');
  console.log('   GreenPulse Mission LiFE — PostgreSQL Schema Migration Engine   ');
  console.log('================================================================');

  let client;
  try {
    client = await getClient();
  } catch (connErr) {
    console.error('\n[DATABASE CONNECTION ERROR]: Could not connect to PostgreSQL.');
    console.error(`Details: ${connErr.message}`);
    console.error(`Host/Target: ${process.env.DATABASE_URL ? '[Configured via DATABASE_URL]' : `${process.env.PGHOST || 'localhost'}:${process.env.PGPORT || 5432}`}`);
    console.error('\nPlease verify that:');
    console.error('1. The PostgreSQL service is installed and running.');
    console.error('2. DATABASE_URL in your .env points to an accessible database.');
    console.error('3. Credentials and network permissions are correct.\n');
    throw connErr;
  }

  try {
    // Acquire session advisory lock to prevent concurrent migrations
    await client.query('SELECT pg_advisory_lock(987654321);');

    // Ensure schema_migrations exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        checksum VARCHAR(64) NOT NULL
      );
    `);

    // Get applied migrations
    const appliedRes = await client.query('SELECT version, checksum FROM schema_migrations ORDER BY version ASC;');
    const appliedMap = new Map(appliedRes.rows.map((r) => [r.version, r.checksum]));

    // Read migration files
    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    let appliedCount = 0;
    const migrationResults = [];

    for (const file of files) {
      const version = file.split('_')[0];
      const name = file.replace(/\.sql$/, '');
      const filePath = path.join(MIGRATIONS_DIR, file);
      const sqlContent = fs.readFileSync(filePath, 'utf8');
      const checksum = getChecksum(sqlContent);

      if (appliedMap.has(version)) {
        const recordedChecksum = appliedMap.get(version);
        if (recordedChecksum !== checksum) {
          console.warn(`[WARNING] Migration ${file} checksum mismatch! File has changed since it was applied.`);
        }
        migrationResults.push({ file, version, status: 'already_applied' });
      } else {
        console.log(`Applying migration [${version}]: ${file}...`);
        await client.query('BEGIN');
        try {
          await client.query(sqlContent);
          await client.query(
            'INSERT INTO schema_migrations (version, name, checksum) VALUES ($1, $2, $3)',
            [version, name, checksum]
          );
          await client.query('COMMIT');
          appliedCount += 1;
          console.log(`✓ [${version}] Migration succeeded: ${file}`);
          migrationResults.push({ file, version, status: 'applied_now' });
        } catch (migErr) {
          await client.query('ROLLBACK');
          console.error(`✗ [ERROR] Failed to apply migration [${file}]:`, migErr.message);
          throw migErr;
        }
      }
    }

    console.log('----------------------------------------------------------------');
    console.log(`Migration Summary: ${appliedCount} applied, ${files.length - appliedCount} already up-to-date.`);
    console.log('================================================================\n');

    return {
      appliedCount,
      totalCount: files.length,
      migrations: migrationResults,
    };
  } finally {
    try {
      await client.query('SELECT pg_advisory_unlock(987654321);');
    } catch {
      // ignore unlock error if client disconnected
    }
    client.release();
  }
}

// Direct execution from CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations()
    .then(async () => {
      await closePool();
      process.exit(0);
    })
    .catch(async (err) => {
      await closePool();
      process.exit(1);
    });
}

export default runMigrations;
