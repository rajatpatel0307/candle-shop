import { randomUUID } from 'node:crypto';
import { getPool, sql } from '../../config/database.js';
import { REFUND_STATUS } from './refunds.constants.js';

export async function getOrderPayment(orderId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('orderId', sql.UniqueIdentifier, orderId)
    .query(`
      SELECT TOP 1 o.*, p.PaymentId, p.ProviderPaymentId, p.PaymentProvider, p.PaymentStatus AS PaymentRecordStatus, p.Amount AS PaymentAmount
      FROM dbo.Orders o
      INNER JOIN dbo.Payments p ON p.OrderId = o.OrderId
      WHERE o.OrderId = @orderId AND p.PaymentStatus = 'SUCCEEDED'
      ORDER BY p.PaidAtUtc DESC;
    `);
  return result.recordset[0] ?? null;
}

export async function listRefundsByOrder(orderId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('orderId', sql.UniqueIdentifier, orderId)
    .query('SELECT * FROM dbo.Refunds WHERE OrderId = @orderId ORDER BY CreatedAtUtc DESC;');
  return result.recordset;
}

export async function getRefund(refundId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('refundId', sql.UniqueIdentifier, refundId)
    .query('SELECT TOP 1 * FROM dbo.Refunds WHERE RefundId = @refundId;');
  return result.recordset[0] ?? null;
}

export async function getRefundableAmount(orderId) {
  const payment = await getOrderPayment(orderId);
  if (!payment) return { payment: null, refundable: 0, refunded: 0 };
  const refunds = await listRefundsByOrder(orderId);
  const refunded = refunds
    .filter((refund) => ['SUCCEEDED', 'PROCESSING', 'APPROVED'].includes(refund.RefundStatus))
    .reduce((sum, refund) => sum + Number(refund.RefundAmount), 0);
  return { payment, refundable: Math.max(0, Number(payment.PaymentAmount) - refunded), refunded };
}

export async function createRefund({ orderPayment, amount, reason, userId, idempotencyKey }) {
  const pool = await getPool();
  if (idempotencyKey) {
    const existing = await pool.request()
      .input('idempotencyKey', sql.UniqueIdentifier, idempotencyKey)
      .query('SELECT TOP 1 * FROM dbo.Refunds WHERE IdempotencyKey = @idempotencyKey;');
    if (existing.recordset[0]) return { refund: existing.recordset[0], idempotent: true };
  }
  const refundNumber = `REF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const result = await pool.request()
    .input('id', sql.UniqueIdentifier, randomUUID())
    .input('orderId', sql.UniqueIdentifier, orderPayment.OrderId)
    .input('paymentId', sql.UniqueIdentifier, orderPayment.PaymentId)
    .input('number', sql.NVarChar(100), refundNumber)
    .input('status', sql.VarChar(30), REFUND_STATUS.PENDING)
    .input('amount', sql.Decimal(18, 2), amount)
    .input('currency', sql.Char(3), orderPayment.CurrencyCode)
    .input('reason', sql.NVarChar(500), reason)
    .input('userId', sql.UniqueIdentifier, userId ?? null)
    .input('idempotencyKey', sql.UniqueIdentifier, idempotencyKey ?? null)
    .query(`
      INSERT INTO dbo.Refunds (
        RefundId, OrderId, PaymentId, RefundNumber, RefundStatus, RefundAmount,
        CurrencyCode, Reason, RequestedByUserId, IdempotencyKey
      )
      OUTPUT inserted.*
      VALUES (@id, @orderId, @paymentId, @number, @status, @amount, @currency, @reason, @userId, @idempotencyKey);
    `);
  return { refund: result.recordset[0], idempotent: false };
}

export async function updateRefundStatus({ refundId, status, providerRefundId, approvedByUserId, completed }) {
  const pool = await getPool();
  const result = await pool.request()
    .input('refundId', sql.UniqueIdentifier, refundId)
    .input('status', sql.VarChar(30), status)
    .input('providerRefundId', sql.NVarChar(200), providerRefundId ?? null)
    .input('approvedByUserId', sql.UniqueIdentifier, approvedByUserId ?? null)
    .query(`
      UPDATE dbo.Refunds
      SET RefundStatus = @status,
          ProviderRefundId = COALESCE(@providerRefundId, ProviderRefundId),
          ApprovedByUserId = COALESCE(@approvedByUserId, ApprovedByUserId),
          CompletedAtUtc = CASE WHEN @status = 'SUCCEEDED' THEN SYSUTCDATETIME() ELSE CompletedAtUtc END,
          UpdatedAtUtc = SYSUTCDATETIME()
      OUTPUT inserted.*
      WHERE RefundId = @refundId;
    `);
  return result.recordset[0] ?? null;
}

export async function listAdminRefunds() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT r.*, o.OrderNumber, u.Email
    FROM dbo.Refunds r
    INNER JOIN dbo.Orders o ON o.OrderId = r.OrderId
    LEFT JOIN dbo.Users u ON u.UserId = o.UserId
    ORDER BY r.CreatedAtUtc DESC;
  `);
  return result.recordset;
}
