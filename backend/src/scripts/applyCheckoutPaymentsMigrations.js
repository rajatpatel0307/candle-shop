import { readFile } from 'node:fs/promises';
import { getPool } from '../config/database.js';

function splitBatches(script) {
  return script
    .split(/^\s*GO\s*$/gim)
    .map((batch) => batch.trim())
    .filter(Boolean);
}

async function applyCheckoutPaymentsMigrations() {
  const filePath = new URL('../../../database/migrations/005_checkout_payments.sql', import.meta.url);
  const script = await readFile(filePath, 'utf8');
  const pool = await getPool();

  for (const batch of splitBatches(script)) {
    await pool.request().query(batch);
  }

  console.log('Checkout and payments migrations applied.');
}

applyCheckoutPaymentsMigrations()
  .catch((error) => {
    console.error('Checkout/payments migration failed:');
    console.error(error?.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await getPool().then((pool) => pool.close()).catch(() => {});
  });
