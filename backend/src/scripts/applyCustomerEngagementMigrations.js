import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { getPool, sql } from '../config/database.js';

function splitBatches(script) {
  return script.split(/^\s*GO\s*$/gim).map((batch) => batch.trim()).filter(Boolean);
}

async function applyCustomerEngagementMigrations() {
  const script = await readFile(resolve(process.cwd(), '../database/migrations/008_customer_engagement.sql'), 'utf8');
  const pool = await getPool();
  for (const batch of splitBatches(script)) await pool.request().query(batch);
  console.log('Customer engagement migrations applied.');
}

applyCustomerEngagementMigrations()
  .catch((error) => {
    console.error('Customer engagement migration failed:');
    console.error(error?.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sql.close();
  });
