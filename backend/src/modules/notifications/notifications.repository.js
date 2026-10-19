import { randomUUID } from 'node:crypto';
import { getPool, sql } from '../../config/database.js';

export async function create({ userId, title, message, type = 'INFO', relatedEntityType, relatedEntityId }) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.UniqueIdentifier, randomUUID())
    .input('userId', sql.UniqueIdentifier, userId)
    .input('type', sql.VarChar(50), type)
    .input('title', sql.NVarChar(200), title)
    .input('message', sql.NVarChar(1000), message)
    .input('entityType', sql.VarChar(50), relatedEntityType ?? null)
    .input('entityId', sql.UniqueIdentifier, relatedEntityId ?? null)
    .query(`
      INSERT INTO dbo.Notifications (NotificationId, UserId, NotificationType, Title, Message, RelatedEntityType, RelatedEntityId)
      OUTPUT inserted.*
      VALUES (@id, @userId, @type, @title, @message, @entityType, @entityId);
    `);
  return result.recordset[0];
}

export async function listForUser(userId, { page, limit }) {
  const pool = await getPool();
  const result = await pool.request()
    .input('userId', sql.UniqueIdentifier, userId)
    .input('limit', sql.Int, limit)
    .input('offset', sql.Int, (page - 1) * limit)
    .query(`
      SELECT *, COUNT(1) OVER() AS TotalRows
      FROM dbo.Notifications
      WHERE UserId = @userId AND (ExpiresAtUtc IS NULL OR ExpiresAtUtc > SYSUTCDATETIME())
      ORDER BY CreatedAtUtc DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
    `);
  return { rows: result.recordset.map(({ TotalRows, ...row }) => row), total: Number(result.recordset[0]?.TotalRows || 0) };
}

export async function unreadCount(userId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('userId', sql.UniqueIdentifier, userId)
    .query('SELECT COUNT(1) AS Count FROM dbo.Notifications WHERE UserId = @userId AND ReadAtUtc IS NULL;');
  return Number(result.recordset[0]?.Count || 0);
}

export async function markRead({ notificationId, userId }) {
  const pool = await getPool();
  const result = await pool.request()
    .input('notificationId', sql.UniqueIdentifier, notificationId)
    .input('userId', sql.UniqueIdentifier, userId)
    .query(`
      UPDATE dbo.Notifications
      SET ReadAtUtc = COALESCE(ReadAtUtc, SYSUTCDATETIME())
      OUTPUT inserted.*
      WHERE NotificationId = @notificationId AND UserId = @userId;
    `);
  return result.recordset[0] ?? null;
}

export async function markAllRead(userId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('userId', sql.UniqueIdentifier, userId)
    .query('UPDATE dbo.Notifications SET ReadAtUtc = COALESCE(ReadAtUtc, SYSUTCDATETIME()) WHERE UserId = @userId AND ReadAtUtc IS NULL;');
  return result.rowsAffected[0];
}

export async function listAdmin({ page, limit, search, status }) {
  const pool=await getPool();
  const request=pool.request().input('limit',sql.Int,limit).input('offset',sql.Int,(page-1)*limit);
  const where=['1=1'];
  if(search){ request.input('search',sql.NVarChar(802),`%${search.replace(/[~%_\[]/g,'~$&')}%`);where.push("(n.Title LIKE @search ESCAPE '~' OR n.Message LIKE @search ESCAPE '~' OR u.Email LIKE @search ESCAPE '~')"); }
  if(status==='READ')where.push('n.ReadAtUtc IS NOT NULL');
  if(status==='UNREAD')where.push('n.ReadAtUtc IS NULL');
  const result=await request.query(`SELECT n.*,u.Email FROM dbo.Notifications n JOIN dbo.Users u ON u.UserId=n.UserId WHERE ${where.join(' AND ')} ORDER BY n.CreatedAtUtc DESC,n.NotificationId DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
    SELECT COUNT(*) AS TotalRows FROM dbo.Notifications n JOIN dbo.Users u ON u.UserId=n.UserId WHERE ${where.join(' AND ')};`);
  return {rows:result.recordsets[0],total:Number(result.recordsets[1][0]?.TotalRows||0)};
}
