import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import EmbeddedPostgres from 'embedded-postgres';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbDir = path.resolve(__dirname, '../../.pgdata');

console.log('================================================================');
console.log('     GreenPulse Mission LiFE — PostgreSQL Service Manager       ');
console.log('================================================================');
console.log(`[PostgreSQL Service] Data Directory: ${dbDir}`);

const pgServer = new EmbeddedPostgres({
  databaseDir: dbDir,
  user: 'postgres',
  password: 'postgres',
  port: 5432,
  persistent: true,
});

async function start() {
  try {
    if (!fs.existsSync(dbDir)) {
      console.log('[PostgreSQL Service] Initializing cluster for first run...');
      await pgServer.initialise();
      console.log('[PostgreSQL Service] Cluster initialized.');
    }

    console.log('[PostgreSQL Service] Starting PostgreSQL server on port 5432...');
    await pgServer.start();
    console.log('[PostgreSQL Service] PostgreSQL is listening on port 5432.');

    try {
      await pgServer.createDatabase('greenpulse_db');
      console.log('[PostgreSQL Service] Created database "greenpulse_db".');
    } catch (dbErr) {
      // Already exists
      console.log('[PostgreSQL Service] Database "greenpulse_db" is ready.');
    }

    console.log('\n[PostgreSQL Service] SUCCESS: Database is accessible at:');
    console.log('postgresql://postgres:postgres@localhost:5432/greenpulse_db');
    console.log('================================================================\n');
  } catch (err) {
    console.error('[PostgreSQL Service Error]:', err.message);
    process.exit(1);
  }
}

// Keep process running if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  start().then(() => {
    console.log('PostgreSQL service is running. Press Ctrl+C to stop.');
  });
}

export { pgServer, start };
export default start;
