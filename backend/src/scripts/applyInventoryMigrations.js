import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { getPool, sql } from '../config/database.js';

function splitBatches(script) {
  return script
    .split(/^\s*GO\s*$/gim)
    .map((batch) => batch.trim())
    .filter(Boolean);
}

async function applyInventoryMigrations() {
  const filePath = resolve(process.cwd(), '../database/migrations/003_inventory_management.sql');
  const script = await readFile(filePath, 'utf8');
  const pool = await getPool();

  for (const batch of splitBatches(script)) {
    await pool.request().query(batch);
  }

  const result = await pool.request().query(`
    SELECT
      DB_NAME() AS DatabaseName,
      CASE WHEN COL_LENGTH('dbo.InventoryMovements', 'IdempotencyKey') IS NULL THEN 0 ELSE 1 END AS HasMovementIdempotency,
      CASE WHEN COL_LENGTH('dbo.InventoryReservations', 'IdempotencyKey') IS NULL THEN 0 ELSE 1 END AS HasReservationIdempotency;
  `);
  const status = result.recordset[0];
  console.log(`Inventory migrations applied to ${status.DatabaseName}.`);
  console.log(`Movement idempotency: ${status.HasMovementIdempotency ? 'ready' : 'missing'}`);
  console.log(`Reservation idempotency: ${status.HasReservationIdempotency ? 'ready' : 'missing'}`);
}

applyInventoryMigrations()
  .catch((error) => {
    console.error('Inventory migration failed:');
    console.error(error?.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sql.close();
  });
