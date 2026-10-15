import { readFile } from 'node:fs/promises';
import { getPool } from '../config/database.js';

let pool;
try {
  const script = await readFile(new URL('../../../database/migrations/009_instant_reviews.sql', import.meta.url), 'utf8');
  pool = await getPool();
  const result = await pool.request().query(script);
  console.log(`Published ${result.rowsAffected[0] || 0} pending reviews.`);
} catch (error) {
  console.error('Could not publish pending reviews:', error.message);
  process.exitCode = 1;
} finally {
  if (pool) await pool.close();
}
