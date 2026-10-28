import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getClient, healthCheck, closePool } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

/**
 * Report database status, applied migrations, and table statistics
 */
export async function getDatabaseStatus() {
  console.log('================================================================');
  console.log('         GreenPulse Mission LiFE — Database Status Check         ');
  console.log('================================================================');

  const health = await healthCheck();
  if (!health.connected) {
    console.error('\n[STATUS: DISCONNECTED]');
    console.error(`Error: ${health.error}`);
    console.error(`Target: ${process.env.DATABASE_URL ? '[Configured via DATABASE_URL]' : `${process.env.PGHOST || 'localhost'}:${process.env.PGPORT || 5432}`}`);
    console.error('\nPostgreSQL database is currently inaccessible.\n');
    return {
      connected: false,
      error: health.error,
    };
  }

  console.log('\n[STATUS: CONNECTED]');
  console.log(`Server Time: ${health.timestamp}`);
  console.log(`PostgreSQL Engine: ${health.version}`);

  let client;
  try {
    client = await getClient();

    // Database size
    const sizeRes = await client.query('SELECT pg_size_pretty(pg_database_size(current_database())) AS db_size, current_database() AS db_name;');
    console.log(`Database Name: ${sizeRes.rows[0].db_name}`);
    console.log(`Database Size: ${sizeRes.rows[0].db_size}`);

    // Check schema_migrations
    const hasMigrationsTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'schema_migrations'
      );
    `);

    let appliedVersions = new Set();
    let appliedRows = [];
    if (hasMigrationsTable.rows[0].exists) {
      const migRes = await client.query('SELECT version, name, applied_at FROM schema_migrations ORDER BY version ASC;');
      appliedRows = migRes.rows;
      appliedVersions = new Set(appliedRows.map((r) => r.version));
    }

    // Local migration files
    const localFiles = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    console.log('\n--- Migration History ---');
    if (localFiles.length === 0) {
      console.log('No migration files found.');
    } else {
      for (const file of localFiles) {
        const version = file.split('_')[0];
        const isApplied = appliedVersions.has(version);
        const appliedInfo = appliedRows.find((r) => r.version === version);
        const statusTag = isApplied
          ? `[APPLIED] (${new Date(appliedInfo.applied_at).toLocaleString()})`
          : '[PENDING]';
        console.log(`  ${version.padEnd(5)} | ${statusTag.padEnd(35)} | ${file}`);
      }
    }

    // List application tables and record counts
    console.log('\n--- Application Tables in public schema ---');
    const tablesRes = await client.query(`
      SELECT 
        table_name,
        (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) AS column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    if (tablesRes.rows.length === 0) {
      console.log('No tables found in public schema. Run "npm run db:migrate" to initialize.');
    } else {
      for (const table of tablesRes.rows) {
        try {
          const countRes = await client.query(`SELECT count(*) AS cnt FROM "${table.table_name}";`);
          console.log(`  • ${table.table_name.padEnd(28)} | ${table.column_count} columns | ${countRes.rows[0].cnt} rows`);
        } catch {
          console.log(`  • ${table.table_name.padEnd(28)} | ${table.column_count} columns`);
        }
      }
    }

    console.log('================================================================\n');

    return {
      connected: true,
      database: sizeRes.rows[0].db_name,
      size: sizeRes.rows[0].db_size,
      appliedMigrationsCount: appliedRows.length,
      totalMigrationsCount: localFiles.length,
      pendingCount: localFiles.length - appliedRows.length,
      tables: tablesRes.rows.map((r) => r.table_name),
    };
  } finally {
    if (client) client.release();
  }
}

// Direct execution from CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  getDatabaseStatus()
    .then(async (status) => {
      await closePool();
      process.exit(status.connected ? 0 : 1);
    })
    .catch(async (err) => {
      console.error('Fatal error during status check:', err);
      await closePool();
      process.exit(1);
    });
}

export default getDatabaseStatus;
