import { AppError } from './AppError.js';

export function isDatabaseConnectionError(error) {
  return ['ELOGIN', 'ESOCKET', 'ETIMEOUT', 'ECONNCLOSED', 'ENOTOPEN'].includes(error?.code)
    || error?.name === 'ConnectionError';
}

export function isDatabaseSchemaError(error) {
  return error?.code === 'EREQUEST'
    && (error?.number === 208 || error?.originalError?.code === 208);
}

export function getDatabaseErrorMessage(error) {
  const message = error?.details?.[0]?.message
    || error?.originalError?.details?.[0]?.message
    || error?.originalError?.message
    || (error?.message && error.message !== '[object Object]' ? error.message : null)
    || null;

  if (message) return message;

  if (error?.name === 'ConnectionError') {
    return 'ODBC connection failed. Check DB_SERVER, SQL Server service, SQL Browser service, and ODBC driver encryption settings.';
  }

  return 'Unknown database error.';
}

export function databaseUnavailableError(error) {
  const driverMessage = getDatabaseErrorMessage(error);

  const reason = error?.code === 'ELOGIN'
    ? 'SQL Server rejected the configured database login. Check DB_USER, DB_PASSWORD, and database permissions in backend/.env.'
    : driverMessage
      ? `The API could not connect to SQL Server: ${driverMessage}`
    : 'The API could not connect to SQL Server. Check DB_SERVER, DB_PORT, DB_NAME, and SQL Server availability.';

  return new AppError(503, 'DATABASE_UNAVAILABLE', reason);
}

export function databaseSchemaError(error) {
  return new AppError(
    503,
    'DATABASE_SCHEMA_MISSING',
    `Database is connected, but required tables are missing. Run the SQL baseline script. Details: ${getDatabaseErrorMessage(error)}`,
  );
}
