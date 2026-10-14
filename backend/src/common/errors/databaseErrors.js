import { AppError } from './AppError.js';

export function isDatabaseConnectionError(error) {
  return ['ELOGIN', 'ESOCKET', 'ETIMEOUT', 'ECONNCLOSED', 'ENOTOPEN'].includes(error?.code)
    || error?.name === 'ConnectionError';
}

export function isDatabaseSchemaError(error) {
  return error?.code === 'EREQUEST'
    && (error?.number === 208 || error?.originalError?.code === 208);
}

export function isDatabaseRequestError(error) {
  return error?.code === 'EREQUEST' || error?.name === 'RequestError';
}

export function databaseRequestError(error) {
  const number = error?.number ?? error?.originalError?.number;
  const messages = {
    245: 'One of the submitted values has an invalid data type.',
    515: 'A required field is missing.',
    547: 'A submitted value violates a relationship or allowed-value rule.',
    2601: 'A record with the same unique value already exists.',
    2627: 'A record with the same unique value already exists.',
  };

  return new AppError(400, 'DATABASE_VALIDATION_ERROR', messages[number] || 'The submitted record could not be saved. Check the field values and try again.');
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
