import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { getPool, sql } from '../config/database.js';

function splitBatches(script) {
  return script.split(/^\s*GO\s*$/gim).map((batch) => batch.trim()).filter(Boolean);
}

async function applyAdminDashboardMigrations() {
  const script = await readFile(resolve(process.cwd(), '../database/migrations/007_admin_dashboard.sql'), 'utf8');
  const pool = await getPool();
  for (const batch of splitBatches(script)) await pool.request().query(batch);
  console.log('Admin dashboard migrations applied.');
}

applyAdminDashboardMigrations()
  .catch((error) => {
    console.error('Admin dashboard migration failed:');
    console.error(error?.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sql.close();
  });
