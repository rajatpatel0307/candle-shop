import app from './app.js';
import { env } from './config/env.js';
import { getPool } from './config/database.js';
import { getDatabaseErrorMessage } from './common/errors/databaseErrors.js';

const requiredTables = ['Roles', 'Users', 'Categories', 'Products', 'ProductVariants', 'Orders'];

async function printDatabaseStatus() {
  try {
    const pool = await getPool();
    const request = pool.request();
    requiredTables.forEach((table, index) => {
      request.input(`table${index}`, table);
    });

    const result = await request.query(`
      SELECT name
      FROM sys.tables
      WHERE schema_id = SCHEMA_ID('dbo')
        AND name IN (${requiredTables.map((_, index) => `@table${index}`).join(', ')});
    `);

    const foundTables = new Set(result.recordset.map((row) => row.name));
    const missingTables = requiredTables.filter((table) => !foundTables.has(table));

    console.log(`Database connected: ${env.DB_NAME} on ${env.DB_SERVER}`);
    if (missingTables.length > 0) {
      console.warn(`Database schema missing tables: ${missingTables.join(', ')}`);
      console.warn('Run your MSSQL baseline SQL script in this database.');
    } else {
      console.log('Database schema ready.');
    }
  } catch (error) {
    console.error(`Database not connected: ${getDatabaseErrorMessage(error)}`);
  }
}

const server = app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
  printDatabaseStatus();
});

async function shutdown(signal) {
  console.log(`${signal} received; shutting down.`);
  server.close(async () => {
    try {
      const pool = await getPool();
      await pool.close();
    } catch {
      // Pool may not have been initialized.
    }
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
