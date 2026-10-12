import { getPool, sql } from '../config/database.js';

async function applyAuthMigrations() {
  const pool = await getPool();

  await pool.request().query(`
    IF OBJECT_ID('dbo.RefreshTokens', 'U') IS NULL
    BEGIN
      THROW 51000, 'dbo.RefreshTokens table does not exist. Run the baseline database schema first.', 1;
    END;

    IF COL_LENGTH('dbo.RefreshTokens', 'SessionId') IS NULL
    BEGIN
      ALTER TABLE dbo.RefreshTokens
        ADD SessionId UNIQUEIDENTIFIER NULL;

      UPDATE dbo.RefreshTokens
      SET SessionId = RefreshTokenId
      WHERE SessionId IS NULL;

      ALTER TABLE dbo.RefreshTokens
        ALTER COLUMN SessionId UNIQUEIDENTIFIER NOT NULL;
    END;
  `);

  const indexExists = await pool.request().query(`
    SELECT 1 AS Found
    FROM sys.indexes
    WHERE name = N'IX_RefreshTokens_User_Session'
      AND object_id = OBJECT_ID(N'dbo.RefreshTokens');
  `);

  if (!indexExists.recordset.length) {
    await pool.request().query(`
      CREATE INDEX IX_RefreshTokens_User_Session
        ON dbo.RefreshTokens(UserId, SessionId)
        INCLUDE (ExpiresAtUtc, RevokedAtUtc, CreatedAtUtc);
    `);
  }

  const result = await pool.request().query(`
    SELECT
      DB_NAME() AS DatabaseName,
      CASE WHEN COL_LENGTH('dbo.RefreshTokens', 'SessionId') IS NULL THEN 0 ELSE 1 END AS HasSessionId;
  `);

  const status = result.recordset[0];
  console.log(`Auth migrations applied to ${status.DatabaseName}. SessionId column: ${status.HasSessionId ? 'ready' : 'missing'}`);
}

applyAuthMigrations()
  .catch((error) => {
    console.error('Auth migration failed:');
    console.error(error?.message || error);
    console.error(JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    if (error?.originalError) console.error(error.originalError);
    if (error?.precedingErrors?.length) console.error(error.precedingErrors);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sql.close();
  });
