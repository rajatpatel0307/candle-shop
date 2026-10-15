import { createHash, randomUUID } from 'node:crypto';
import { getPool, sql } from '../../config/database.js';
import { CHECKOUT_STATUS, ORDER_STATUS, PAYMENT_STATUS, ADDRESS_TYPE } from './checkout.constants.js';
import { AppError } from '../../common/errors/AppError.js';

export function requestHash(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

export async function findOrderForSession({ userId, sessionId }) {
  const pool = await getPool();
  const result = await pool.request()
    .input('userId', sql.UniqueIdentifier, userId)
    .input('sessionId', sql.UniqueIdentifier, sessionId)
    .query('SELECT TOP 1 * FROM dbo.Orders WHERE UserId = @userId AND CheckoutSessionId = @sessionId;');
  return result.recordset[0] ?? null;
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

export async function createUserAddress(userId, input) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.UniqueIdentifier, randomUUID())
    .input('userId', sql.UniqueIdentifier, userId)
    .input('label', sql.NVarChar(50), input.addressLabel)
    .input('name', sql.NVarChar(150), input.recipientName)
    .input('phone', sql.NVarChar(30), input.phoneNumber)
    .input('line1', sql.NVarChar(200), input.addressLine1)
    .input('line2', sql.NVarChar(200), input.addressLine2 || null)
    .input('locality', sql.NVarChar(120), input.locality || null)
    .input('city', sql.NVarChar(100), input.city)
    .input('state', sql.NVarChar(100), input.stateOrProvince)
    .input('postal', sql.NVarChar(20), input.postalCode)
    .input('country', sql.Char(2), input.countryCode)
    .query(`
      INSERT INTO dbo.UserAddresses (AddressId, UserId, AddressLabel, RecipientName, PhoneNumber,
        AddressLine1, AddressLine2, Locality, City, StateOrProvince, PostalCode, CountryCode,
        IsDefaultShipping, IsDefaultBilling)
      OUTPUT inserted.*
      VALUES (@id, @userId, @label, @name, @phone, @line1, @line2, @locality, @city, @state, @postal, @country, 0, 0);
    `);
  return result.recordset[0];
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
      WHERE CheckoutSessionId = @sessionId AND UserId = @userId AND SessionStatus IN ('ACTIVE', 'Open') AND ExpiresAtUtc > SYSUTCDATETIME();
    `);
  return result.recordset[0] ?? null;
}

export async function updateShippingMethod({ sessionId, userId, shippingMethodId }) {
  const pool = await getPool();
  const result = await pool.request()
    .input('sessionId', sql.UniqueIdentifier, sessionId)
    .input('userId', sql.UniqueIdentifier, userId)
    .input('shippingMethodId', sql.Int, shippingMethodId ?? null)
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

export async function createOrderTransaction({ userId, session, pricing, shippingAddress, billingAddress, idempotencyKey, paymentMethod = 'ONLINE' }) {
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

    const locked = await new sql.Request(transaction)
      .input('sessionId', sql.UniqueIdentifier, session.CheckoutSessionId)
      .input('userId', sql.UniqueIdentifier, userId)
      .query(`SELECT s.*, c.CartStatus FROM dbo.CheckoutSessions s WITH (UPDLOCK, HOLDLOCK)
        INNER JOIN dbo.Carts c WITH (UPDLOCK, HOLDLOCK) ON c.CartId = s.CartId
        WHERE s.CheckoutSessionId = @sessionId AND s.UserId = @userId;`);
    const current = locked.recordset[0];
    if (!current || !['ACTIVE', 'OPEN'].includes(String(current.SessionStatus).toUpperCase()) || String(current.CartStatus).toUpperCase() !== 'ACTIVE' || new Date(current.ExpiresAtUtc) <= new Date()) {
      throw new AppError(409, 'CHECKOUT_SESSION_INACTIVE', 'This checkout has expired or has already been submitted. Start a new checkout.');
    }

    const orderId = randomUUID();
    const orderNumber = `CAN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const order = await new sql.Request(transaction)
      .input('orderId', sql.UniqueIdentifier, orderId)
      .input('orderNumber', sql.NVarChar(30), orderNumber)
      .input('userId', sql.UniqueIdentifier, userId)
      .input('sessionId', sql.UniqueIdentifier, session.CheckoutSessionId)
      .input('paymentMethod', sql.NVarChar(30), paymentMethod)
      .input('currency', sql.Char(3), pricing.currencyCode)
      .input('orderStatus', sql.VarChar(30), paymentMethod === 'COD' ? ORDER_STATUS.CONFIRMED : ORDER_STATUS.PENDING_PAYMENT)
      .input('paymentStatus', sql.VarChar(30), PAYMENT_STATUS.PENDING)
      .input('subtotal', sql.Decimal(18, 2), pricing.subtotal)
      .input('discount', sql.Decimal(18, 2), pricing.discountAmount)
      .input('shipping', sql.Decimal(18, 2), pricing.shippingAmount)
      .input('tax', sql.Decimal(18, 2), pricing.taxAmount)
      .input('total', sql.Decimal(18, 2), pricing.totalAmount)
      .input('idempotencyKey', sql.UniqueIdentifier, idempotencyKey)
      .query(`
        INSERT INTO dbo.Orders (
          OrderId, OrderNumber, UserId, CheckoutSessionId, CurrencyCode, OrderStatus, PaymentStatus,
          Subtotal, DiscountTotal, ShippingTotal, TaxTotal, GrandTotal, IdempotencyKey, PaymentMethod
        )
        OUTPUT inserted.*
        VALUES (
          @orderId, @orderNumber, @userId, @sessionId, @currency, @orderStatus, @paymentStatus,
          @subtotal, @discount, @shipping, @tax, @total, @idempotencyKey, @paymentMethod
        );
      `);

    for (const item of [...pricing.items].sort((a, b) => a.ProductVariantId.localeCompare(b.ProductVariantId))) {
      // Allocate stock in the same transaction as the order, so a failure leaves no partial order.
      const allocated = await new sql.Request(transaction)
        .input('variantId', sql.UniqueIdentifier, item.ProductVariantId)
        .input('quantity', sql.Int, item.Quantity)
        .query(`UPDATE dbo.Inventory WITH (UPDLOCK)
          SET ${paymentMethod === 'COD' ? 'OnHandQuantity = OnHandQuantity - @quantity' : 'ReservedQuantity = ReservedQuantity + @quantity'}
          OUTPUT deleted.OnHandQuantity AS PreviousQuantity, inserted.OnHandQuantity AS NewQuantity
          WHERE ProductVariantId = @variantId AND OnHandQuantity - ReservedQuantity >= @quantity;`);
      if (!allocated.recordset.length) throw new AppError(409, 'INSUFFICIENT_STOCK', 'An item is no longer available in the requested quantity. Update your cart and try again.');
      if (paymentMethod === 'COD') {
        await new sql.Request(transaction)
          .input('variantId', sql.UniqueIdentifier, item.ProductVariantId)
          .input('quantity', sql.Int, -item.Quantity)
          .input('previous', sql.Int, allocated.recordset[0].PreviousQuantity)
          .input('next', sql.Int, allocated.recordset[0].NewQuantity)
          .input('orderId', sql.UniqueIdentifier, orderId)
          .input('userId', sql.UniqueIdentifier, userId)
          .query(`INSERT INTO dbo.InventoryMovements (ProductVariantId, MovementType, QuantityChange,
            PreviousOnHandQuantity, NewOnHandQuantity, ReferenceType, ReferenceId, CreatedByUserId, Notes)
            VALUES (@variantId, 'ORDER_DEDUCTION', @quantity, @previous, @next, 'Order', @orderId, @userId, N'Cash on delivery order placed.');`);
      } else {
        await new sql.Request(transaction)
          .input('id', sql.UniqueIdentifier, randomUUID())
          .input('variantId', sql.UniqueIdentifier, item.ProductVariantId)
          .input('orderId', sql.UniqueIdentifier, orderId)
          .input('sessionId', sql.UniqueIdentifier, session.CheckoutSessionId)
          .input('cartId', sql.UniqueIdentifier, pricing.cartId)
          .input('quantity', sql.Int, item.Quantity)
          .input('userId', sql.UniqueIdentifier, userId)
          .query(`INSERT INTO dbo.InventoryReservations (InventoryReservationId, ProductVariantId, OrderId,
            CheckoutSessionId, CartId, Quantity, ReservationStatus, ExpiresAtUtc, CreatedByUserId)
            VALUES (@id, @variantId, @orderId, @sessionId, @cartId, @quantity, 'ACTIVE', DATEADD(minute, 30, SYSUTCDATETIME()), @userId);`);
      }
      await new sql.Request(transaction)
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
            OrderId, ProductVariantId, SKUSnapshot, ProductNameSnapshot,
            VariantNameSnapshot, UnitPrice, Quantity, DiscountAmount, TaxAmount, LineTotal
          )
          VALUES (@orderId, @variantId, @sku, @name, @variant, @unitPrice, @quantity, 0, 0, @lineTotal);
        `);
    }

    await insertOrderAddress(transaction, orderId, ADDRESS_TYPE.SHIPPING, shippingAddress);
    await insertOrderAddress(transaction, orderId, ADDRESS_TYPE.BILLING, billingAddress);

    await new sql.Request(transaction)
      .input('orderId', sql.UniqueIdentifier, orderId)
      .input('status', sql.VarChar(30), paymentMethod === 'COD' ? ORDER_STATUS.CONFIRMED : ORDER_STATUS.PENDING_PAYMENT)
      .input('userId', sql.UniqueIdentifier, userId)
      .query(`
        INSERT INTO dbo.OrderStatusHistory (OrderId, PreviousStatus, NewStatus, ChangedByUserId, ChangeReason)
        VALUES (@orderId, NULL, @status, @userId, N'Order created from checkout.');
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
      .query("UPDATE dbo.Carts SET CartStatus = 'Converted', UpdatedAtUtc = SYSUTCDATETIME() WHERE CartId = @cartId;");

    if (paymentMethod === 'COD') {
      await new sql.Request(transaction)
        .input('cartId', sql.UniqueIdentifier, pricing.cartId)
        .input('orderId', sql.UniqueIdentifier, orderId)
        .query(`DELETE ci FROM dbo.CartItems ci
          INNER JOIN dbo.OrderItems oi ON oi.ProductVariantId = ci.ProductVariantId AND oi.OrderId = @orderId
          WHERE ci.CartId = @cartId;`);
    }

    await transaction.commit();
    return { order: order.recordset[0], idempotent: false };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function insertOrderAddress(transaction, orderId, type, address) {
  await new sql.Request(transaction)
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
        OrderId, AddressType, RecipientName, PhoneNumber, AddressLine1,
        AddressLine2, Locality, City, StateOrProvince, PostalCode, CountryCode
      )
      VALUES (@orderId, @type, @name, @phone, @line1, @line2, @locality, @city, @state, @postal, @country);
    `);
}
