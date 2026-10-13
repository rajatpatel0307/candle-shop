import { randomUUID } from 'node:crypto';
import { getPool, sql } from '../../config/database.js';
import { CANCELLATION_STATUS, ORDER_STATUS } from './orders.constants.js';

function paging({ page, limit }) {
  return { limit, offset: (page - 1) * limit };
}

export async function listCustomerOrders(userId, query) {
  const pool = await getPool();
  const page = paging(query);
  const request = pool.request()
    .input('userId', sql.UniqueIdentifier, userId)
    .input('limit', sql.Int, page.limit)
    .input('offset', sql.Int, page.offset);
  const where = ['o.UserId = @userId'];
  if (query.status) {
    request.input('status', sql.VarChar(30), query.status);
    where.push('o.OrderStatus = @status');
  }
  const result = await request.query(`
    SELECT o.*, COUNT(1) OVER() AS TotalRows,
      (SELECT TOP 1 ShipmentStatus FROM dbo.Shipments s WHERE s.OrderId = o.OrderId ORDER BY s.CreatedAtUtc DESC) AS LatestShipmentStatus
    FROM dbo.Orders o
    WHERE ${where.join(' AND ')}
    ORDER BY o.CreatedAtUtc ${query.sortDir === 'asc' ? 'ASC' : 'DESC'}
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
  `);
  const total = Number(result.recordset[0]?.TotalRows || 0);
  return { rows: result.recordset.map(({ TotalRows, ...row }) => row), total };
}

export async function listAdminOrders(query) {
  const pool = await getPool();
  const page = paging(query);
  const request = pool.request().input('limit', sql.Int, page.limit).input('offset', sql.Int, page.offset);
  const where = ['1 = 1'];
  if (query.status) {
    request.input('status', sql.VarChar(30), query.status);
    where.push('o.OrderStatus = @status');
  }
  if (query.paymentStatus) {
    request.input('paymentStatus', sql.VarChar(30), query.paymentStatus);
    where.push('o.PaymentStatus = @paymentStatus');
  }
  if (query.search) {
    request.input('search', sql.NVarChar(120), `%${query.search}%`);
    where.push('(o.OrderNumber LIKE @search OR u.Email LIKE @search OR u.FirstName LIKE @search OR u.LastName LIKE @search)');
  }
  const result = await request.query(`
    SELECT o.*, u.Email, u.FirstName, u.LastName, COUNT(1) OVER() AS TotalRows,
      (SELECT TOP 1 ShipmentStatus FROM dbo.Shipments s WHERE s.OrderId = o.OrderId ORDER BY s.CreatedAtUtc DESC) AS LatestShipmentStatus,
      (SELECT TOP 1 RefundStatus FROM dbo.Refunds r WHERE r.OrderId = o.OrderId ORDER BY r.CreatedAtUtc DESC) AS LatestRefundStatus
    FROM dbo.Orders o
    LEFT JOIN dbo.Users u ON u.UserId = o.UserId
    WHERE ${where.join(' AND ')}
    ORDER BY o.CreatedAtUtc ${query.sortDir === 'asc' ? 'ASC' : 'DESC'}
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
  `);
  const total = Number(result.recordset[0]?.TotalRows || 0);
  return { rows: result.recordset.map(({ TotalRows, ...row }) => row), total };
}

export async function getOrder(orderId, userId = null) {
  const pool = await getPool();
  const request = pool.request().input('orderId', sql.UniqueIdentifier, orderId);
  const owner = userId ? 'AND o.UserId = @userId' : '';
  if (userId) request.input('userId', sql.UniqueIdentifier, userId);
  const order = await request.query(`
    SELECT o.*, u.Email, u.FirstName, u.LastName
    FROM dbo.Orders o
    LEFT JOIN dbo.Users u ON u.UserId = o.UserId
    WHERE o.OrderId = @orderId ${owner};
  `);
  return order.recordset[0] ?? null;
}

export async function getOrderDetails(orderId, userId = null) {
  const order = await getOrder(orderId, userId);
  if (!order) return null;
  const pool = await getPool();
  const request = pool.request().input('orderId', sql.UniqueIdentifier, orderId);
  const [items, addresses, history, shipments, refunds, cancellations, reservations] = await Promise.all([
    request.query('SELECT * FROM dbo.OrderItems WHERE OrderId = @orderId ORDER BY CreatedAtUtc ASC;'),
    pool.request().input('orderId', sql.UniqueIdentifier, orderId).query('SELECT * FROM dbo.OrderAddresses WHERE OrderId = @orderId ORDER BY AddressType DESC;'),
    pool.request().input('orderId', sql.UniqueIdentifier, orderId).query('SELECT * FROM dbo.OrderStatusHistory WHERE OrderId = @orderId ORDER BY ChangedAtUtc ASC;'),
    pool.request().input('orderId', sql.UniqueIdentifier, orderId).query('SELECT * FROM dbo.Shipments WHERE OrderId = @orderId ORDER BY CreatedAtUtc DESC;'),
    pool.request().input('orderId', sql.UniqueIdentifier, orderId).query('SELECT * FROM dbo.Refunds WHERE OrderId = @orderId ORDER BY CreatedAtUtc DESC;'),
    pool.request().input('orderId', sql.UniqueIdentifier, orderId).query('SELECT * FROM dbo.OrderCancellationRequests WHERE OrderId = @orderId ORDER BY RequestedAtUtc DESC;'),
    pool.request().input('orderId', sql.UniqueIdentifier, orderId).query('SELECT * FROM dbo.InventoryReservations WHERE OrderId = @orderId ORDER BY ExpiresAtUtc DESC;'),
  ]);
  const shipmentRows = shipments.recordset;
  const trackingEvents = shipmentRows.length
    ? await pool.request().input('orderId', sql.UniqueIdentifier, orderId).query(`
        SELECT te.*
        FROM dbo.ShipmentTrackingEvents te
        INNER JOIN dbo.Shipments s ON s.ShipmentId = te.ShipmentId
        WHERE s.OrderId = @orderId
        ORDER BY te.OccurredAtUtc DESC;
      `)
    : { recordset: [] };
  const eventsByShipment = trackingEvents.recordset.reduce((map, event) => {
    map[event.ShipmentId] = [...(map[event.ShipmentId] || []), event];
    return map;
  }, {});
  const shipmentsWithEvents = shipmentRows.map((shipment) => ({ ...shipment, trackingEvents: eventsByShipment[shipment.ShipmentId] || [] }));
  return { order, items: items.recordset, addresses: addresses.recordset, history: history.recordset, shipments: shipmentsWithEvents, refunds: refunds.recordset, cancellations: cancellations.recordset, reservations: reservations.recordset };
}

export async function updateOrderStatus({ orderId, nextStatus, userId, reason, source = 'ADMIN' }) {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  try {
    const locked = await new sql.Request(transaction)
      .input('orderId', sql.UniqueIdentifier, orderId)
      .query('SELECT TOP 1 * FROM dbo.Orders WITH (UPDLOCK, ROWLOCK) WHERE OrderId = @orderId;');
    const order = locked.recordset[0];
    if (!order) {
      await transaction.rollback();
      return null;
    }
    if (order.OrderStatus === nextStatus) {
      await transaction.commit();
      return order;
    }
    const updated = await new sql.Request(transaction)
      .input('orderId', sql.UniqueIdentifier, orderId)
      .input('status', sql.VarChar(30), nextStatus)
      .input('reason', sql.NVarChar(500), nextStatus === ORDER_STATUS.CANCELLED ? reason ?? null : null)
      .query(`
        UPDATE dbo.Orders
        SET OrderStatus = @status,
            CancellationReason = COALESCE(@reason, CancellationReason),
            CancelledAtUtc = CASE WHEN @status = 'CANCELLED' THEN SYSUTCDATETIME() ELSE CancelledAtUtc END,
            UpdatedAtUtc = SYSUTCDATETIME()
        OUTPUT inserted.*
        WHERE OrderId = @orderId;
      `);
    await new sql.Request(transaction)
      .input('id', sql.UniqueIdentifier, randomUUID())
      .input('orderId', sql.UniqueIdentifier, orderId)
      .input('oldStatus', sql.VarChar(30), order.OrderStatus)
      .input('newStatus', sql.VarChar(30), nextStatus)
      .input('userId', sql.UniqueIdentifier, userId ?? null)
      .input('notes', sql.NVarChar(500), `[${source}] ${reason || 'Status updated.'}`)
      .query(`
        INSERT INTO dbo.OrderStatusHistory (OrderStatusHistoryId, OrderId, OldStatus, NewStatus, ChangedByUserId, Notes)
        VALUES (@id, @orderId, @oldStatus, @newStatus, @userId, @notes);
      `);
    await transaction.commit();
    return updated.recordset[0];
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function createCancellationRequest({ orderId, userId, reason }) {
  const pool = await getPool();
  const existing = await pool.request()
    .input('orderId', sql.UniqueIdentifier, orderId)
    .input('userId', sql.UniqueIdentifier, userId)
    .query("SELECT TOP 1 * FROM dbo.OrderCancellationRequests WHERE OrderId = @orderId AND UserId = @userId AND RequestStatus = 'REQUESTED' ORDER BY RequestedAtUtc DESC;");
  if (existing.recordset[0]) return { request: existing.recordset[0], idempotent: true };
  const result = await pool.request()
    .input('id', sql.UniqueIdentifier, randomUUID())
    .input('orderId', sql.UniqueIdentifier, orderId)
    .input('userId', sql.UniqueIdentifier, userId)
    .input('reason', sql.NVarChar(500), reason)
    .input('status', sql.VarChar(30), CANCELLATION_STATUS.REQUESTED)
    .query(`
      INSERT INTO dbo.OrderCancellationRequests (OrderCancellationRequestId, OrderId, UserId, Reason, RequestStatus)
      OUTPUT inserted.*
      VALUES (@id, @orderId, @userId, @reason, @status);
    `);
  return { request: result.recordset[0], idempotent: false };
}

export async function listCancellations(orderId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('orderId', sql.UniqueIdentifier, orderId)
    .query('SELECT * FROM dbo.OrderCancellationRequests WHERE OrderId = @orderId ORDER BY RequestedAtUtc DESC;');
  return result.recordset;
}
