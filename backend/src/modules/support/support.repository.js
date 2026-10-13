import { randomUUID } from 'node:crypto';
import { getPool, sql } from '../../config/database.js';

function number() {
  return `TKT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export async function createTicket({ userId, input }) {
  const pool = await getPool();
  const tx = new sql.Transaction(pool);
  await tx.begin();
  try {
    const ticketId = randomUUID();
    const ticket = await new sql.Request(tx)
      .input('id', sql.UniqueIdentifier, ticketId)
      .input('number', sql.NVarChar(50), number())
      .input('userId', sql.UniqueIdentifier, userId)
      .input('orderId', sql.UniqueIdentifier, input.orderId ?? null)
      .input('subject', sql.NVarChar(200), input.subject)
      .input('description', sql.NVarChar(4000), input.message)
      .input('category', sql.NVarChar(80), input.category ?? null)
      .input('priority', sql.VarChar(20), input.priority)
      .query(`
        INSERT INTO dbo.SupportTickets (SupportTicketId, TicketNumber, UserId, OrderId, Subject, Description, Category, TicketStatus, Priority)
        OUTPUT inserted.*
        VALUES (@id, @number, @userId, @orderId, @subject, @description, @category, 'OPEN', @priority);
      `);
    await insertMessage(tx, { ticketId, senderUserId: userId, message: input.message, isInternalNote: false });
    await tx.commit();
    return ticket.recordset[0];
  } catch (error) {
    await tx.rollback();
    throw error;
  }
}

async function insertMessage(tx, { ticketId, senderUserId, message, isInternalNote }) {
  const result = await new sql.Request(tx)
    .input('id', sql.UniqueIdentifier, randomUUID())
    .input('ticketId', sql.UniqueIdentifier, ticketId)
    .input('senderUserId', sql.UniqueIdentifier, senderUserId)
    .input('message', sql.NVarChar(4000), message)
    .input('internal', sql.Bit, isInternalNote)
    .query(`
      INSERT INTO dbo.SupportTicketMessages (SupportTicketMessageId, SupportTicketId, SenderUserId, Message, IsInternalNote)
      OUTPUT inserted.*
      VALUES (@id, @ticketId, @senderUserId, @message, @internal);
    `);
  return result.recordset[0];
}

export async function addMessage({ ticketId, senderUserId, message, isInternalNote }) {
  const pool = await getPool();
  const tx = new sql.Transaction(pool);
  await tx.begin();
  try {
    const inserted = await insertMessage(tx, { ticketId, senderUserId, message, isInternalNote });
    await new sql.Request(tx)
      .input('ticketId', sql.UniqueIdentifier, ticketId)
      .query("UPDATE dbo.SupportTickets SET UpdatedAtUtc = SYSUTCDATETIME(), TicketStatus = CASE WHEN TicketStatus = 'RESOLVED' THEN 'IN_PROGRESS' ELSE TicketStatus END WHERE SupportTicketId = @ticketId;");
    await tx.commit();
    return inserted;
  } catch (error) {
    await tx.rollback();
    throw error;
  }
}

export async function listMine(userId, { page, limit }) {
  const pool = await getPool();
  const result = await pool.request()
    .input('userId', sql.UniqueIdentifier, userId)
    .input('limit', sql.Int, limit)
    .input('offset', sql.Int, (page - 1) * limit)
    .query(`
      SELECT *, COUNT(1) OVER() AS TotalRows FROM dbo.SupportTickets
      WHERE UserId = @userId
      ORDER BY CreatedAtUtc DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
    `);
  return { rows: result.recordset.map(({ TotalRows, ...row }) => row), total: Number(result.recordset[0]?.TotalRows || 0) };
}

export async function listAdmin({ page, limit, status }) {
  const pool = await getPool();
  const request = pool.request().input('limit', sql.Int, limit).input('offset', sql.Int, (page - 1) * limit);
  const where = ['1 = 1'];
  if (status) {
    request.input('status', sql.VarChar(30), status);
    where.push('t.TicketStatus = @status');
  }
  const result = await request.query(`
    SELECT t.*, u.Email, COUNT(1) OVER() AS TotalRows
    FROM dbo.SupportTickets t
    INNER JOIN dbo.Users u ON u.UserId = t.UserId
    WHERE ${where.join(' AND ')}
    ORDER BY t.CreatedAtUtc DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
  `);
  return { rows: result.recordset.map(({ TotalRows, ...row }) => row), total: Number(result.recordset[0]?.TotalRows || 0) };
}

export async function getTicket(ticketId, userId = null, includeInternal = false) {
  const pool = await getPool();
  const request = pool.request().input('ticketId', sql.UniqueIdentifier, ticketId);
  const owner = userId ? 'AND UserId = @userId' : '';
  if (userId) request.input('userId', sql.UniqueIdentifier, userId);
  const ticket = await request.query(`SELECT TOP 1 * FROM dbo.SupportTickets WHERE SupportTicketId = @ticketId ${owner};`);
  if (!ticket.recordset[0]) return null;
  const messages = await pool.request()
    .input('ticketId', sql.UniqueIdentifier, ticketId)
    .query(`SELECT * FROM dbo.SupportTicketMessages WHERE SupportTicketId = @ticketId ${includeInternal ? '' : 'AND IsInternalNote = 0'} ORDER BY CreatedAtUtc ASC;`);
  return { ticket: ticket.recordset[0], messages: messages.recordset };
}

export async function updateTicket(ticketId, input) {
  const current = await getTicket(ticketId, null, true);
  if (!current) return null;
  const pool = await getPool();
  const status = input.status ?? current.ticket.TicketStatus;
  const result = await pool.request()
    .input('ticketId', sql.UniqueIdentifier, ticketId)
    .input('status', sql.VarChar(30), status)
    .input('priority', sql.VarChar(20), input.priority ?? current.ticket.Priority)
    .input('assignedTo', sql.UniqueIdentifier, input.assignedToUserId ?? current.ticket.AssignedToUserId ?? null)
    .query(`
      UPDATE dbo.SupportTickets
      SET TicketStatus = @status, Priority = @priority, AssignedToUserId = @assignedTo,
          ResolvedAtUtc = CASE WHEN @status = 'RESOLVED' THEN COALESCE(ResolvedAtUtc, SYSUTCDATETIME()) ELSE ResolvedAtUtc END,
          ClosedAtUtc = CASE WHEN @status = 'CLOSED' THEN COALESCE(ClosedAtUtc, SYSUTCDATETIME()) ELSE ClosedAtUtc END,
          UpdatedAtUtc = SYSUTCDATETIME()
      OUTPUT inserted.*
      WHERE SupportTicketId = @ticketId;
    `);
  return result.recordset[0] ?? null;
}
