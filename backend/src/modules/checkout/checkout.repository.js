import { createHash, randomUUID } from 'node:crypto';
import { getPool, sql } from '../../config/database.js';
import { CHECKOUT_STATUS, ORDER_STATUS, PAYMENT_STATUS, ADDRESS_TYPE } from './checkout.constants.js';

export function requestHash(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

export async function createSession({ userId, cartId, idempotencyKey, expiresAt }) {
  const pool = await getPool();
  if (idempotencyKey) {
    const existing = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .input('idempotencyKey', sql.UniqueIdentifier, idempotencyKey)
      .query('SELECT TOP 1 * FROM dbo.CheckoutSessions WHERE UserId = @userId AND IdempotencyKey = @idempotencyKey ORDER BY CreatedAtUtc DESC;');
    if (existing.recordset[0]) return { session: existing.recordset[0], idempotent: true };
  }

  const result = await pool.request()
    .input('id', sql.UniqueIdentifier, randomUUID())
    .input('cartId', sql.UniqueIdentifier, cartId)
    .input('userId', sql.UniqueIdentifier, userId)
    .input('status', sql.VarChar(30), CHECKOUT_STATUS.ACTIVE)
    .input('idempotencyKey', sql.UniqueIdentifier, idempotencyKey ?? null)
    .input('expiresAt', sql.DateTime2, expiresAt)
    .query(`
      INSERT INTO dbo.CheckoutSessions (CheckoutSessionId, CartId, UserId, SessionStatus, IdempotencyKey, ExpiresAtUtc)
      OUTPUT inserted.*
      VALUES (@id, @cartId, @userId, @status, @idempotencyKey, @expiresAt);
    `);
  return { session: result.recordset[0], idempotent: false };
}

export async function getSessionForUser({ sessionId, userId }) {
  const pool = await getPool();
  const result = await pool.request()
    .input('sessionId', sql.UniqueIdentifier, sessionId)
    .input('userId', sql.UniqueIdentifier, userId)
    .query('SELECT TOP 1 * FROM dbo.CheckoutSessions WHERE CheckoutSessionId = @sessionId AND UserId = @userId;');
  return result.recordset[0] ?? null;
}

export async function getUserAddress({ userId, addressId }) {
  const pool = await getPool();
  const result = await pool.request()
    .input('userId', sql.UniqueIdentifier, userId)
    .input('addressId', sql.UniqueIdentifier, addressId)
    .query('SELECT TOP 1 * FROM dbo.UserAddresses WHERE AddressId = @addressId AND UserId = @userId;');
  return result.recordset[0] ?? null;
}

export async function listUserAddresses(userId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('userId', sql.UniqueIdentifier, userId)
    .query('SELECT * FROM dbo.UserAddresses WHERE UserId = @userId ORDER BY IsDefaultShipping DESC, IsDefaultBilling DESC, City ASC;');
  return result.recordset;
}

export async function updateAddresses({ sessionId, userId, shippingAddressId, billingAddressId }) {
  const pool = await getPool();
  const result = await pool.request()
    .input('sessionId', sql.UniqueIdentifier, sessionId)
    .input('userId', sql.UniqueIdentifier, userId)
    .input('shippingAddressId', sql.UniqueIdentifier, shippingAddressId)
    .input('billingAddressId', sql.UniqueIdentifier, billingAddressId)
    .query(`
      UPDATE dbo.CheckoutSessions
      SET ShippingAddressId = @shippingAddressId,
          BillingAddressId = @billingAddressId,
          UpdatedAtUtc = SYSUTCDATETIME()
      OUTPUT inserted.*
      WHERE CheckoutSessionId = @sessionId AND UserId = @userId AND SessionStatus = 'ACTIVE';
    `);
  return result.recordset[0] ?? null;
}

export async function updateShippingMethod({ sessionId, userId, shippingMethodId }) {
  const pool = await getPool();
  const result = await pool.request()
    .input('sessionId', sql.UniqueIdentifier, sessionId)
    .input('userId', sql.UniqueIdentifier, userId)
    .input('shippingMethodId', sql.UniqueIdentifier, shippingMethodId ?? null)
    .query(`
      UPDATE dbo.CheckoutSessions
      SET ShippingMethodId = @shippingMethodId,
          UpdatedAtUtc = SYSUTCDATETIME()
      OUTPUT inserted.*
      WHERE CheckoutSessionId = @sessionId AND UserId = @userId AND SessionStatus = 'ACTIVE';
    `);
  return result.recordset[0] ?? null;
}

export async function updateDiscount({ sessionId, userId, couponCode }) {
  const pool = await getPool();
  const result = await pool.request()
    .input('sessionId', sql.UniqueIdentifier, sessionId)
    .input('userId', sql.UniqueIdentifier, userId)
    .input('couponCode', sql.NVarChar(50), couponCode ?? null)
    .query(`
      UPDATE dbo.CheckoutSessions
      SET CouponCode = @couponCode,
          UpdatedAtUtc = SYSUTCDATETIME()
      OUTPUT inserted.*
      WHERE CheckoutSessionId = @sessionId AND UserId = @userId AND SessionStatus = 'ACTIVE';
    `);
  return result.recordset[0] ?? null;
}

export async function findOrderByIdempotencyKey({ userId, idempotencyKey }) {
  const pool = await getPool();
  const result = await pool.request()
    .input('userId', sql.UniqueIdentifier, userId)
    .input('idempotencyKey', sql.UniqueIdentifier, idempotencyKey)
    .query('SELECT TOP 1 * FROM dbo.Orders WHERE UserId = @userId AND IdempotencyKey = @idempotencyKey;');
  return result.recordset[0] ?? null;
}

export async function createOrderTransaction({ userId, session, pricing, shippingAddress, billingAddress, idempotencyKey }) {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  try {
    const existing = await new sql.Request(transaction)
      .input('userId', sql.UniqueIdentifier, userId)
      .input('idempotencyKey', sql.UniqueIdentifier, idempotencyKey)
      .query('SELECT TOP 1 * FROM dbo.Orders WITH (UPDLOCK, HOLDLOCK) WHERE UserId = @userId AND IdempotencyKey = @idempotencyKey;');
    if (existing.recordset[0]) {
      await transaction.commit();
      return { order: existing.recordset[0], idempotent: true };
    }

    const orderId = randomUUID();
    const orderNumber = `CAN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const order = await new sql.Request(transaction)
      .input('orderId', sql.UniqueIdentifier, orderId)
      .input('orderNumber', sql.NVarChar(30), orderNumber)
      .input('userId', sql.UniqueIdentifier, userId)
      .input('cartId', sql.UniqueIdentifier, pricing.cartId)
      .input('currency', sql.Char(3), pricing.currencyCode)
      .input('orderStatus', sql.VarChar(30), ORDER_STATUS.PENDING_PAYMENT)
      .input('paymentStatus', sql.VarChar(30), PAYMENT_STATUS.PENDING)
      .input('subtotal', sql.Decimal(18, 2), pricing.subtotal)
      .input('discount', sql.Decimal(18, 2), pricing.discountAmount)
      .input('shipping', sql.Decimal(18, 2), pricing.shippingAmount)
      .input('tax', sql.Decimal(18, 2), pricing.taxAmount)
      .input('total', sql.Decimal(18, 2), pricing.totalAmount)
      .input('idempotencyKey', sql.UniqueIdentifier, idempotencyKey)
      .query(`
        INSERT INTO dbo.Orders (
          OrderId, OrderNumber, UserId, CartId, CurrencyCode, OrderStatus, PaymentStatus,
          SubtotalAmount, DiscountAmount, ShippingAmount, TaxAmount, GrandTotal, IdempotencyKey
        )
        OUTPUT inserted.*
        VALUES (
          @orderId, @orderNumber, @userId, @cartId, @currency, @orderStatus, @paymentStatus,
          @subtotal, @discount, @shipping, @tax, @total, @idempotencyKey
        );
      `);

    for (const item of pricing.items) {
      await new sql.Request(transaction)
        .input('id', sql.UniqueIdentifier, randomUUID())
        .input('orderId', sql.UniqueIdentifier, orderId)
        .input('variantId', sql.UniqueIdentifier, item.ProductVariantId)
        .input('sku', sql.NVarChar(100), item.SKU ?? null)
        .input('name', sql.NVarChar(200), item.ProductName)
        .input('variant', sql.NVarChar(200), item.VariantName ?? null)
        .input('unitPrice', sql.Decimal(18, 2), item.UnitPrice)
        .input('quantity', sql.Int, item.Quantity)
        .input('lineTotal', sql.Decimal(18, 2), item.LineTotal)
        .query(`
          INSERT INTO dbo.OrderItems (
            OrderItemId, OrderId, ProductVariantId, SKU, ProductNameSnapshot,
            VariantNameSnapshot, UnitPrice, Quantity, DiscountAmount, TaxAmount, LineTotal
          )
          VALUES (@id, @orderId, @variantId, @sku, @name, @variant, @unitPrice, @quantity, 0, 0, @lineTotal);
        `);
    }

    await insertOrderAddress(transaction, orderId, ADDRESS_TYPE.SHIPPING, shippingAddress);
    await insertOrderAddress(transaction, orderId, ADDRESS_TYPE.BILLING, billingAddress);

    await new sql.Request(transaction)
      .input('id', sql.UniqueIdentifier, randomUUID())
      .input('orderId', sql.UniqueIdentifier, orderId)
      .input('status', sql.VarChar(30), ORDER_STATUS.PENDING_PAYMENT)
      .input('userId', sql.UniqueIdentifier, userId)
      .query(`
        INSERT INTO dbo.OrderStatusHistory (OrderStatusHistoryId, OrderId, OldStatus, NewStatus, ChangedByUserId, Notes)
        VALUES (@id, @orderId, NULL, @status, @userId, N'Order created from checkout.');
      `);

    await new sql.Request(transaction)
      .input('sessionId', sql.UniqueIdentifier, session.CheckoutSessionId)
      .input('orderId', sql.UniqueIdentifier, orderId)
      .input('hash', sql.Char(64), requestHash({ idempotencyKey, total: pricing.totalAmount, items: pricing.items.map((item) => [item.ProductVariantId, item.Quantity, item.UnitPrice]) }))
      .query(`
        UPDATE dbo.CheckoutSessions
        SET SessionStatus = 'SUBMITTED',
            OrderId = @orderId,
            RequestHash = @hash,
            UpdatedAtUtc = SYSUTCDATETIME()
        WHERE CheckoutSessionId = @sessionId;
      `);

    await new sql.Request(transaction)
      .input('cartId', sql.UniqueIdentifier, pricing.cartId)
      .query("UPDATE dbo.Carts SET CartStatus = 'CONVERTED', UpdatedAtUtc = SYSUTCDATETIME() WHERE CartId = @cartId;");

    await transaction.commit();
    return { order: order.recordset[0], idempotent: false };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function insertOrderAddress(transaction, orderId, type, address) {
  await new sql.Request(transaction)
    .input('id', sql.UniqueIdentifier, randomUUID())
    .input('orderId', sql.UniqueIdentifier, orderId)
    .input('type', sql.VarChar(20), type)
    .input('name', sql.NVarChar(150), address.RecipientName)
    .input('phone', sql.NVarChar(30), address.PhoneNumber ?? null)
    .input('line1', sql.NVarChar(200), address.AddressLine1)
    .input('line2', sql.NVarChar(200), address.AddressLine2 ?? null)
    .input('locality', sql.NVarChar(120), address.Locality ?? null)
    .input('city', sql.NVarChar(120), address.City)
    .input('state', sql.NVarChar(120), address.StateOrProvince ?? null)
    .input('postal', sql.NVarChar(20), address.PostalCode)
    .input('country', sql.Char(2), address.CountryCode)
    .query(`
      INSERT INTO dbo.OrderAddresses (
        OrderAddressId, OrderId, AddressType, RecipientName, PhoneNumber, AddressLine1,
        AddressLine2, Locality, City, StateOrProvince, PostalCode, CountryCode
      )
      VALUES (@id, @orderId, @type, @name, @phone, @line1, @line2, @locality, @city, @state, @postal, @country);
    `);
}
