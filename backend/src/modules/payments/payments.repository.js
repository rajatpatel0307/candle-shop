import { randomUUID } from 'node:crypto';
import { getPool, sql } from '../../config/database.js';
import { ORDER_STATUS, PAYMENT_PROVIDER, PAYMENT_STATUS, WEBHOOK_STATUS } from './payments.constants.js';

export async function getOrderForUser({ orderId, userId }) {
  const pool = await getPool();
  const result = await pool.request()
    .input('orderId', sql.UniqueIdentifier, orderId)
    .input('userId', sql.UniqueIdentifier, userId)
    .query('SELECT TOP 1 * FROM dbo.Orders WHERE OrderId = @orderId AND UserId = @userId;');
  return result.recordset[0] ?? null;
}

export async function getOrderByProviderOrderId(providerOrderId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('provider', sql.VarChar(50), PAYMENT_PROVIDER.RAZORPAY)
    .input('providerOrderId', sql.NVarChar(200), providerOrderId)
    .query(`
      SELECT TOP 1 o.*, p.PaymentId, p.PaymentStatus AS CurrentPaymentStatus
      FROM dbo.Payments p
      INNER JOIN dbo.Orders o ON o.OrderId = p.OrderId
      WHERE p.PaymentProvider = @provider AND p.ProviderOrderId = @providerOrderId
      ORDER BY p.CreatedAtUtc DESC;
    `);
  return result.recordset[0] ?? null;
}

export async function getLatestPayment(orderId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('orderId', sql.UniqueIdentifier, orderId)
    .query('SELECT TOP 1 * FROM dbo.Payments WHERE OrderId = @orderId ORDER BY CreatedAtUtc DESC;');
  return result.recordset[0] ?? null;
}

export async function createPendingPayment({ order, idempotencyKey }) {
  const pool = await getPool();
  const existing = await getLatestPayment(order.OrderId);
  if (existing && [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.PROCESSING, PAYMENT_STATUS.SUCCEEDED].includes(existing.PaymentStatus)) {
    return { payment: existing, idempotent: true };
  }
  const result = await pool.request()
    .input('id', sql.UniqueIdentifier, randomUUID())
    .input('orderId', sql.UniqueIdentifier, order.OrderId)
    .input('provider', sql.VarChar(50), PAYMENT_PROVIDER.RAZORPAY)
    .input('status', sql.VarChar(30), PAYMENT_STATUS.PENDING)
    .input('idempotencyKey', sql.UniqueIdentifier, idempotencyKey ?? null)
    .input('amount', sql.Decimal(18, 2), order.GrandTotal)
    .input('currency', sql.Char(3), order.CurrencyCode)
    .query(`
      INSERT INTO dbo.Payments (PaymentId, OrderId, PaymentProvider, PaymentStatus, IdempotencyKey, Amount, CurrencyCode)
      OUTPUT inserted.*
      VALUES (@id, @orderId, @provider, @status, @idempotencyKey, @amount, @currency);
    `);
  return { payment: result.recordset[0], idempotent: false };
}

export async function attachProviderOrder({ paymentId, providerOrderId }) {
  const pool = await getPool();
  const result = await pool.request()
    .input('paymentId', sql.UniqueIdentifier, paymentId)
    .input('providerOrderId', sql.NVarChar(200), providerOrderId)
    .query(`
      UPDATE dbo.Payments
      SET ProviderOrderId = @providerOrderId,
          PaymentStatus = 'PROCESSING',
          UpdatedAtUtc = SYSUTCDATETIME()
      OUTPUT inserted.*
      WHERE PaymentId = @paymentId;
    `);
  return result.recordset[0] ?? null;
}

export async function markPaymentSucceeded({ providerOrderId, providerPaymentId }) {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  try {
    const paymentResult = await new sql.Request(transaction)
      .input('provider', sql.VarChar(50), PAYMENT_PROVIDER.RAZORPAY)
      .input('providerOrderId', sql.NVarChar(200), providerOrderId)
      .query(`
        SELECT TOP 1 * FROM dbo.Payments WITH (UPDLOCK, ROWLOCK)
        WHERE PaymentProvider = @provider AND ProviderOrderId = @providerOrderId
        ORDER BY CreatedAtUtc DESC;
      `);
    const payment = paymentResult.recordset[0];
    if (!payment) {
      await transaction.rollback();
      return null;
    }
    if (payment.PaymentStatus === PAYMENT_STATUS.SUCCEEDED) {
      await transaction.commit();
      return { payment, idempotent: true };
    }

    const updatedPayment = await new sql.Request(transaction)
      .input('paymentId', sql.UniqueIdentifier, payment.PaymentId)
      .input('providerPaymentId', sql.NVarChar(200), providerPaymentId)
      .query(`
        UPDATE dbo.Payments
        SET PaymentStatus = 'SUCCEEDED',
            ProviderPaymentId = @providerPaymentId,
            PaidAtUtc = SYSUTCDATETIME(),
            UpdatedAtUtc = SYSUTCDATETIME()
        OUTPUT inserted.*
        WHERE PaymentId = @paymentId;
      `);

    await new sql.Request(transaction)
      .input('orderId', sql.UniqueIdentifier, payment.OrderId)
      .input('confirmed', sql.VarChar(30), ORDER_STATUS.CONFIRMED)
      .input('paid', sql.VarChar(30), PAYMENT_STATUS.SUCCEEDED)
      .query(`
        UPDATE dbo.Orders
        SET OrderStatus = @confirmed,
            PaymentStatus = @paid,
            UpdatedAtUtc = SYSUTCDATETIME()
        WHERE OrderId = @orderId AND PaymentStatus <> @paid;
      `);

    await transaction.commit();
    return { payment: updatedPayment.recordset[0], idempotent: false };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function markPaymentFailed({ providerOrderId, code, message }) {
  const pool = await getPool();
  const result = await pool.request()
    .input('provider', sql.VarChar(50), PAYMENT_PROVIDER.RAZORPAY)
    .input('providerOrderId', sql.NVarChar(200), providerOrderId)
    .input('code', sql.NVarChar(100), code ?? null)
    .input('message', sql.NVarChar(500), message ?? null)
    .query(`
      UPDATE dbo.Payments
      SET PaymentStatus = CASE WHEN PaymentStatus = 'SUCCEEDED' THEN PaymentStatus ELSE 'FAILED' END,
          FailureCode = @code,
          FailureReason = @message,
          UpdatedAtUtc = SYSUTCDATETIME()
      OUTPUT inserted.*
      WHERE PaymentProvider = @provider AND ProviderOrderId = @providerOrderId;
    `);
  return result.recordset[0] ?? null;
}

export async function listActiveReservationsForOrder(orderId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('orderId', sql.UniqueIdentifier, orderId)
    .query(`
      SELECT *
      FROM dbo.InventoryReservations
      WHERE OrderId = @orderId AND ReservationStatus = 'ACTIVE'
      ORDER BY ExpiresAtUtc ASC;
    `);
  return result.recordset;
}

export async function insertWebhookEvent({ providerEventId, eventType, payloadJson }) {
  const pool = await getPool();
  try {
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, randomUUID())
      .input('provider', sql.VarChar(50), PAYMENT_PROVIDER.RAZORPAY)
      .input('eventId', sql.NVarChar(200), providerEventId)
      .input('eventType', sql.NVarChar(150), eventType)
      .input('status', sql.VarChar(30), WEBHOOK_STATUS.PROCESSING)
      .input('payload', sql.NVarChar(sql.MAX), payloadJson)
      .query(`
        INSERT INTO dbo.PaymentWebhookEvents (
          PaymentWebhookEventId, PaymentProvider, ProviderEventId, EventType, ProcessingStatus, PayloadJson, AttemptCount
        )
        OUTPUT inserted.*
        VALUES (@id, @provider, @eventId, @eventType, @status, @payload, 1);
      `);
    return { event: result.recordset[0], duplicate: false };
  } catch (error) {
    if (error?.number === 2601 || error?.number === 2627) {
      return { event: null, duplicate: true };
    }
    throw error;
  }
}

export async function completeWebhookEvent({ providerEventId, status, error }) {
  const pool = await getPool();
  await pool.request()
    .input('provider', sql.VarChar(50), PAYMENT_PROVIDER.RAZORPAY)
    .input('eventId', sql.NVarChar(200), providerEventId)
    .input('status', sql.VarChar(30), status)
    .input('error', sql.NVarChar(1000), error ?? null)
    .query(`
      UPDATE dbo.PaymentWebhookEvents
      SET ProcessingStatus = @status,
          ProcessingError = @error,
          ProcessedAtUtc = CASE WHEN @status = 'PROCESSED' THEN SYSUTCDATETIME() ELSE ProcessedAtUtc END
      WHERE PaymentProvider = @provider AND ProviderEventId = @eventId;
    `);
}
