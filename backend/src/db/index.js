import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Parse connection configuration
const connectionString = process.env.DATABASE_URL;

const poolConfig = connectionString
  ? { connectionString }
  : {
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT || '5432', 10),
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
      database: process.env.PGDATABASE || 'greenpulse_db',
    };

export const pool = new Pool({
  ...poolConfig,
  max: parseInt(process.env.DB_POOL_MAX || '20', 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[PostgreSQL Pool Error]: Unexpected client error', err);
});

/**
 * Execute a parameterized SQL query
 * @param {string} text - SQL statement with $1, $2 placeholders
 * @param {Array} params - Parameter values
 * @returns {Promise<pg.QueryResult>}
 */
export async function query(text, params = []) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development' && process.env.DB_LOG_QUERIES === 'true') {
      console.log('[PostgreSQL Query]', { text, duration: `${duration}ms`, rows: res.rowCount });
    }
    return res;
  } catch (err) {
    console.error('[PostgreSQL Query Error]:', { text, error: err.message });
    throw err;
  }
}

/**
 * Get a client from the pool for manual transaction management
 * @returns {Promise<pg.PoolClient>}
 */
export async function getClient() {
  return await pool.connect();
}

/**
 * Execute a callback within an atomic PostgreSQL transaction
 * Automatically performs BEGIN, COMMIT, or ROLLBACK.
 * @param {function(pg.PoolClient): Promise<any>} callback
 * @returns {Promise<any>}
 */
export async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Safe database connectivity health check
 * Performs a lightweight SELECT test without modifying data.
 * @returns {Promise<{connected: boolean, timestamp?: string, version?: string, error?: string}>}
 */
export async function healthCheck() {
  try {
    const res = await pool.query('SELECT 1 AS alive, CURRENT_TIMESTAMP AS server_time, version() AS pg_version;');
    return {
      connected: true,
      timestamp: res.rows[0].server_time,
      version: res.rows[0].pg_version,
    };
  } catch (err) {
    return {
      connected: false,
      error: err.message,
      code: err.code || 'CONNECTION_FAILED',
    };
  }
}

/**
 * Close database pool cleanly (for tests and graceful shutdowns)
 */
export async function closePool() {
  await pool.end();
}

export default {
  pool,
  query,
  getClient,
  withTransaction,
  healthCheck,
  closePool,
};
