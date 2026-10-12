import { env } from './env.js';

const sqlModule = env.DB_DRIVER === 'msnodesqlv8'
  ? await import('mssql/msnodesqlv8.js')
  : await import('mssql');

const sql = sqlModule.default ?? sqlModule;

function buildConnectionString() {
  if (env.DB_CONNECTION_STRING) return env.DB_CONNECTION_STRING;

  return [
    'Driver={ODBC Driver 17 for SQL Server}',
    `Server=${env.DB_SERVER}`,
    `Database=${env.DB_NAME}`,
    'Trusted_Connection=Yes',
    `Encrypt=${env.DB_ENCRYPT === 'true' ? 'Yes' : 'No'}`,
    `TrustServerCertificate=${env.DB_TRUST_SERVER_CERTIFICATE === 'true' ? 'Yes' : 'No'}`,
  ].join(';');
}

const baseConfig = {
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
  connectionTimeout: 15000,
  requestTimeout: 15000,
};

const config = env.DB_DRIVER === 'msnodesqlv8'
  ? {
      ...baseConfig,
      connectionString: buildConnectionString(),
    }
  : {
      ...baseConfig,
      server: env.DB_SERVER,
      ...(env.DB_PORT ? { port: env.DB_PORT } : {}),
      database: env.DB_NAME,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      options: {
        encrypt: env.DB_ENCRYPT === 'true',
        trustServerCertificate: env.DB_TRUST_SERVER_CERTIFICATE === 'true',
      },
    };

let poolPromise;

export function getPool() {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(config).connect().catch((error) => {
      poolPromise = undefined;
      throw error;
    });
  }
  return poolPromise;
}

export { sql };
