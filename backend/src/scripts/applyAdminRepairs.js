import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { getPool, sql } from '../config/database.js';

try {
  const pool = await getPool();
  for (const name of ['010_inventory_reorder_quantity.sql', '011_admin_settings_fields.sql']) {
    const migration = fileURLToPath(new URL(`../../../database/migrations/${name}`, import.meta.url));
    await pool.request().query(await readFile(migration, 'utf8'));
  }
  console.log('Admin inventory and settings repairs applied.');
  await pool.close();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await sql.close();
}
