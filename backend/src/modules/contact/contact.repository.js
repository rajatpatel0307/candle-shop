import { randomUUID } from 'node:crypto';
import { getPool, sql } from '../../config/database.js';

export async function createMessage(input, userId = null) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.UniqueIdentifier, randomUUID())
    .input('userId', sql.UniqueIdentifier, userId)
    .input('name', sql.NVarChar(200), input.name)
    .input('email', sql.NVarChar(320), input.email)
    .input('subject', sql.NVarChar(200), input.subject)
    .input('message', sql.NVarChar(4000), input.message)
    .query(`
      INSERT INTO dbo.ContactMessages (ContactMessageId, UserId, Name, Email, Subject, Message, MessageStatus)
      OUTPUT inserted.*
      VALUES (@id, @userId, @name, @email, @subject, @message, 'NEW');
    `);
  return result.recordset[0];
}

export async function listMine(userId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('userId', sql.UniqueIdentifier, userId)
    .query('SELECT ContactMessageId, Subject, MessageStatus, CreatedAtUtc, ResolvedAtUtc FROM dbo.ContactMessages WHERE UserId = @userId ORDER BY CreatedAtUtc DESC;');
  return result.recordset;
}

export async function listAdmin({ page, limit, status }) {
  const pool = await getPool();
  const request = pool.request().input('limit', sql.Int, limit).input('offset', sql.Int, (page - 1) * limit);
  const where = ['1 = 1'];
  if (status) {
    request.input('status', sql.VarChar(30), status);
    where.push('MessageStatus = @status');
  }
  const result = await request.query(`
    SELECT *, COUNT(1) OVER() AS TotalRows
    FROM dbo.ContactMessages
    WHERE ${where.join(' AND ')}
    ORDER BY CreatedAtUtc DESC
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
  `);
  return { rows: result.recordset.map(({ TotalRows, ...row }) => row), total: Number(result.recordset[0]?.TotalRows || 0) };
}

export async function getMessage(messageId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('messageId', sql.UniqueIdentifier, messageId)
    .query('SELECT TOP 1 * FROM dbo.ContactMessages WHERE ContactMessageId = @messageId;');
  return result.recordset[0] ?? null;
}

export async function updateMessage(messageId, input) {
  const current = await getMessage(messageId);
  if (!current) return null;
  const pool = await getPool();
  const status = input.status ?? current.MessageStatus;
  const result = await pool.request()
    .input('messageId', sql.UniqueIdentifier, messageId)
    .input('status', sql.VarChar(30), status)
    .input('assignedTo', sql.UniqueIdentifier, input.assignedToUserId ?? current.AssignedToUserId ?? null)
    .input('response', sql.NVarChar(4000), input.adminResponse ?? current.AdminResponse ?? null)
    .query(`
      UPDATE dbo.ContactMessages
      SET MessageStatus = @status,
          AssignedToUserId = @assignedTo,
          AdminResponse = @response,
          UpdatedAtUtc = SYSUTCDATETIME(),
          ResolvedAtUtc = CASE WHEN @status IN ('RESOLVED', 'CLOSED') THEN COALESCE(ResolvedAtUtc, SYSUTCDATETIME()) ELSE ResolvedAtUtc END
      OUTPUT inserted.*
      WHERE ContactMessageId = @messageId;
    `);
  return result.recordset[0] ?? null;
}
