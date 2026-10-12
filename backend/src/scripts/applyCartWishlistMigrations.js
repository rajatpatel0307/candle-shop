import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { getPool, sql } from '../config/database.js';

function splitBatches(script) {
  return script
    .split(/^\s*GO\s*$/gim)
    .map((batch) => batch.trim())
    .filter(Boolean);
}

async function applyCartWishlistMigrations() {
  const filePath = resolve(process.cwd(), '../database/migrations/004_cart_wishlist.sql');
  const script = await readFile(filePath, 'utf8');
  const pool = await getPool();

  for (const batch of splitBatches(script)) {
    await pool.request().query(batch);
  }

  console.log('Cart and wishlist migrations applied.');
}

applyCartWishlistMigrations()
  .catch((error) => {
    console.error('Cart/wishlist migration failed:');
    console.error(error?.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sql.close();
  });
