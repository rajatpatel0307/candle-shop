import { randomUUID } from 'node:crypto';
import { getPool, sql } from '../../config/database.js';
import { MOVEMENT_TYPES, RESERVATION_STATUS } from './inventory.constants.js';

const sortColumns = {
  product: 'p.ProductName',
  sku: 'v.SKU',
  onHand: 'inv.OnHandQuantity',
  reserved: 'inv.ReservedQuantity',
  available: 'inv.AvailableQuantity',
  reorderLevel: 'inv.ReorderLevel',
};

function inventorySelect() {
  return `
    inv.ProductVariantId,
    inv.OnHandQuantity,
    inv.ReservedQuantity,
    inv.AvailableQuantity,
    inv.ReorderLevel,
    COALESCE(inv.ReorderQuantity, 0) AS ReorderQuantity,
    p.ProductId,
    p.ProductName,
    p.Slug,
    p.ProductStatus,
    c.CategoryId,
    c.CategoryName,
    v.SKU,
    v.VariantName,
    v.SizeValue,
    v.SizeUnit,
    v.SellingPrice,
    v.IsActive,
    img.ImageUrl
  `;
}

function applyListFilters(request, filters) {
  const where = ['1 = 1'];
  if (filters.search) {
    request.input('search', sql.NVarChar(220), `%${filters.search}%`);
    where.push('(p.ProductName LIKE @search OR v.SKU LIKE @search OR v.VariantName LIKE @search)');
  }
  if (filters.categoryId) {
    request.input('categoryId', sql.Int, filters.categoryId);
    where.push('p.CategoryId = @categoryId');
  }
  if (filters.status === 'low-stock') where.push('inv.AvailableQuantity > 0 AND inv.AvailableQuantity <= inv.ReorderLevel');
  if (filters.status === 'out-of-stock') where.push('inv.AvailableQuantity <= 0');
  if (filters.status === 'in-stock') where.push('inv.AvailableQuantity > inv.ReorderLevel');
  return where;
}

export async function listInventory(filters) {
  const pool = await getPool();
  const request = pool.request();
  const where = applyListFilters(request, filters);
  const sortColumn = sortColumns[filters.sortBy] || sortColumns.product;
  const sortDir = filters.sortDir === 'desc' ? 'DESC' : 'ASC';
  request.input('limit', sql.Int, filters.limit);
  request.input('offset', sql.Int, filters.offset);

  const result = await request.query(`
    SELECT ${inventorySelect()}, COUNT(1) OVER() AS TotalRows
    FROM dbo.Inventory inv
    INNER JOIN dbo.ProductVariants v ON v.ProductVariantId = inv.ProductVariantId
    INNER JOIN dbo.Products p ON p.ProductId = v.ProductId
    LEFT JOIN dbo.Categories c ON c.CategoryId = p.CategoryId
    OUTER APPLY (
      SELECT TOP 1 ImageUrl
      FROM dbo.ProductImages pi
      WHERE pi.ProductId = p.ProductId AND (pi.ProductVariantId IS NULL OR pi.ProductVariantId = v.ProductVariantId)
      ORDER BY pi.IsPrimary DESC, pi.DisplayOrder ASC
    ) img
    WHERE ${where.join(' AND ')}
    ORDER BY ${sortColumn} ${sortDir}
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
  `);

  const total = Number(result.recordset[0]?.TotalRows || 0);
  return { rows: result.recordset.map(({ TotalRows, ...row }) => row), total };
}

export async function getInventory(productVariantId, transaction = null) {
  const executor = transaction ? new sql.Request(transaction) : (await getPool()).request();
  const result = await executor
    .input('productVariantId', sql.UniqueIdentifier, productVariantId)
    .query(`
      SELECT ${inventorySelect()}
      FROM dbo.Inventory inv
      INNER JOIN dbo.ProductVariants v ON v.ProductVariantId = inv.ProductVariantId
      INNER JOIN dbo.Products p ON p.ProductId = v.ProductId
      LEFT JOIN dbo.Categories c ON c.CategoryId = p.CategoryId
      OUTER APPLY (
        SELECT TOP 1 ImageUrl
        FROM dbo.ProductImages pi
        WHERE pi.ProductId = p.ProductId AND (pi.ProductVariantId IS NULL OR pi.ProductVariantId = v.ProductVariantId)
        ORDER BY pi.IsPrimary DESC, pi.DisplayOrder ASC
      ) img
      WHERE inv.ProductVariantId = @productVariantId;
    `);
  return result.recordset[0] ?? null;
}

export async function getSummary() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT
      COUNT(1) AS TotalRecords,
      COALESCE(SUM(OnHandQuantity), 0) AS TotalOnHand,
      COALESCE(SUM(ReservedQuantity), 0) AS TotalReserved,
      COALESCE(SUM(AvailableQuantity), 0) AS TotalAvailable,
      SUM(CASE WHEN AvailableQuantity > 0 AND AvailableQuantity <= ReorderLevel THEN 1 ELSE 0 END) AS LowStockItems,
      SUM(CASE WHEN AvailableQuantity <= 0 THEN 1 ELSE 0 END) AS OutOfStockItems
    FROM dbo.Inventory;
  `);
  return result.recordset[0];
}

export async function updateReorderSettings({ productVariantId, reorderLevel, reorderQuantity }) {
  const pool = await getPool();
  const result = await pool.request()
    .input('productVariantId', sql.UniqueIdentifier, productVariantId)
    .input('reorderLevel', sql.Int, reorderLevel)
    .input('reorderQuantity', sql.Int, reorderQuantity ?? 0)
    .query(`
      UPDATE dbo.Inventory
      SET ReorderLevel = @reorderLevel,
          ReorderQuantity = @reorderQuantity
      WHERE ProductVariantId = @productVariantId;
    `);
  return result.rowsAffected[0] > 0;
}

async function findMovementByIdempotencyKey(transaction, idempotencyKey) {
  if (!idempotencyKey) return null;
  const result = await new sql.Request(transaction)
    .input('idempotencyKey', sql.UniqueIdentifier, idempotencyKey)
    .query(`
      SELECT TOP 1 *
      FROM dbo.InventoryMovements
      WHERE IdempotencyKey = @idempotencyKey;
    `);
  return result.recordset[0] ?? null;
}

export async function recordReceipt({ productVariantId, quantity, referenceType, referenceId, notes, userId, idempotencyKey }) {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  try {
    const existing = await findMovementByIdempotencyKey(transaction, idempotencyKey);
    if (existing) {
      await transaction.commit();
      return { movement: existing, idempotent: true };
    }

    const locked = await new sql.Request(transaction)
      .input('productVariantId', sql.UniqueIdentifier, productVariantId)
      .query(`
        SELECT ProductVariantId, OnHandQuantity
        FROM dbo.Inventory WITH (UPDLOCK, ROWLOCK)
        WHERE ProductVariantId = @productVariantId;
      `);
    const current = locked.recordset[0];
    if (!current) {
      await transaction.rollback();
      return null;
    }

    const previous = Number(current.OnHandQuantity);
    const next = previous + quantity;
    await new sql.Request(transaction)
      .input('productVariantId', sql.UniqueIdentifier, productVariantId)
      .input('next', sql.Int, next)
      .query(`
        UPDATE dbo.Inventory
        SET OnHandQuantity = @next
        WHERE ProductVariantId = @productVariantId;
      `);

    const movement = await insertMovement(transaction, {
      productVariantId,
      movementType: MOVEMENT_TYPES.RECEIPT,
      quantityChange: quantity,
      previous,
      next,
      referenceType,
      referenceId,
      notes,
      userId,
      idempotencyKey,
    });

    await transaction.commit();
    return { movement, idempotent: false };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function recordAdjustment({ productVariantId, type, quantity, reason, referenceType, referenceId, userId, idempotencyKey }) {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  try {
    const existing = await findMovementByIdempotencyKey(transaction, idempotencyKey);
    if (existing) {
      await transaction.commit();
      return { movement: existing, idempotent: true };
    }

    const locked = await new sql.Request(transaction)
      .input('productVariantId', sql.UniqueIdentifier, productVariantId)
      .query(`
        SELECT ProductVariantId, OnHandQuantity, ReservedQuantity
        FROM dbo.Inventory WITH (UPDLOCK, ROWLOCK)
        WHERE ProductVariantId = @productVariantId;
      `);
    const current = locked.recordset[0];
    if (!current) {
      await transaction.rollback();
      return null;
    }

    const previous = Number(current.OnHandQuantity);
    const reserved = Number(current.ReservedQuantity);
    const signedQuantity = type === 'IN' ? quantity : -quantity;
    const next = previous + signedQuantity;
    if (next < reserved || next < 0) {
      await transaction.rollback();
      return { insufficientStock: true, reserved };
    }

    await new sql.Request(transaction)
      .input('productVariantId', sql.UniqueIdentifier, productVariantId)
      .input('next', sql.Int, next)
      .query(`
        UPDATE dbo.Inventory
        SET OnHandQuantity = @next
        WHERE ProductVariantId = @productVariantId;
      `);

    const movement = await insertMovement(transaction, {
      productVariantId,
      movementType: type === 'IN' ? MOVEMENT_TYPES.ADJUSTMENT_IN : MOVEMENT_TYPES.ADJUSTMENT_OUT,
      quantityChange: signedQuantity,
      previous,
      next,
      referenceType,
      referenceId,
      notes: reason,
      userId,
      idempotencyKey,
    });

    await transaction.commit();
    return { movement, idempotent: false };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function listMovements({ productVariantId, movementType, limit, offset }) {
  const pool = await getPool();
  const request = pool.request();
  const where = ['1 = 1'];
  if (productVariantId) {
    request.input('productVariantId', sql.UniqueIdentifier, productVariantId);
    where.push('m.ProductVariantId = @productVariantId');
  }
  if (movementType) {
    request.input('movementType', sql.VarChar(30), movementType);
    where.push('m.MovementType = @movementType');
  }
  request.input('limit', sql.Int, limit);
  request.input('offset', sql.Int, offset);

  const result = await request.query(`
    SELECT m.*, p.ProductName, v.SKU, v.VariantName, COUNT(1) OVER() AS TotalRows
    FROM dbo.InventoryMovements m
    INNER JOIN dbo.ProductVariants v ON v.ProductVariantId = m.ProductVariantId
    INNER JOIN dbo.Products p ON p.ProductId = v.ProductId
    WHERE ${where.join(' AND ')}
    ORDER BY m.CreatedAtUtc DESC
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
  `);
  const total = Number(result.recordset[0]?.TotalRows || 0);
  return { rows: result.recordset.map(({ TotalRows, ...row }) => row), total };
}

export async function createReservation({ productVariantId, quantity, cartId, orderId, expiresAt, userId, idempotencyKey }) {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  try {
    const existing = await findReservationByIdempotencyKey(transaction, idempotencyKey);
    if (existing) {
      await transaction.commit();
      return { reservation: existing, idempotent: true };
    }

    const reserve = await new sql.Request(transaction)
      .input('productVariantId', sql.UniqueIdentifier, productVariantId)
      .input('quantity', sql.Int, quantity)
      .query(`
        UPDATE dbo.Inventory
        SET ReservedQuantity = ReservedQuantity + @quantity
        WHERE ProductVariantId = @productVariantId
          AND OnHandQuantity - ReservedQuantity >= @quantity;
      `);
    if (reserve.rowsAffected[0] === 0) {
      await transaction.rollback();
      return { insufficientStock: true };
    }

    const reservationId = randomUUID();
    const inserted = await new sql.Request(transaction)
      .input('reservationId', sql.UniqueIdentifier, reservationId)
      .input('productVariantId', sql.UniqueIdentifier, productVariantId)
      .input('cartId', sql.UniqueIdentifier, cartId ?? null)
      .input('orderId', sql.UniqueIdentifier, orderId ?? null)
      .input('quantity', sql.Int, quantity)
      .input('status', sql.VarChar(20), RESERVATION_STATUS.ACTIVE)
      .input('expiresAt', sql.DateTime2, expiresAt)
      .input('userId', sql.UniqueIdentifier, userId ?? null)
      .input('idempotencyKey', sql.UniqueIdentifier, idempotencyKey ?? null)
      .query(`
        INSERT INTO dbo.InventoryReservations (
          InventoryReservationId, ProductVariantId, CartId, OrderId, Quantity,
          ReservationStatus, ExpiresAtUtc, CreatedByUserId, IdempotencyKey
        )
        OUTPUT inserted.*
        VALUES (
          @reservationId, @productVariantId, @cartId, @orderId, @quantity,
          @status, @expiresAt, @userId, @idempotencyKey
        );
      `);

    await transaction.commit();
    return { reservation: inserted.recordset[0], idempotent: false };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function listReservations({ status, limit, offset }) {
  const pool = await getPool();
  const request = pool.request();
  const where = ['1 = 1'];
  if (status) {
    request.input('status', sql.VarChar(20), status);
    where.push('r.ReservationStatus = @status');
  }
  request.input('limit', sql.Int, limit);
  request.input('offset', sql.Int, offset);

  const result = await request.query(`
    SELECT r.*, p.ProductName, v.SKU, v.VariantName, COUNT(1) OVER() AS TotalRows
    FROM dbo.InventoryReservations r
    INNER JOIN dbo.ProductVariants v ON v.ProductVariantId = r.ProductVariantId
    INNER JOIN dbo.Products p ON p.ProductId = v.ProductId
    WHERE ${where.join(' AND ')}
    ORDER BY r.ExpiresAtUtc DESC
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
  `);
  const total = Number(result.recordset[0]?.TotalRows || 0);
  return { rows: result.recordset.map(({ TotalRows, ...row }) => row), total };
}

export async function getReservation(reservationId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('reservationId', sql.UniqueIdentifier, reservationId)
    .query(`
      SELECT r.*, p.ProductName, v.SKU, v.VariantName
      FROM dbo.InventoryReservations r
      INNER JOIN dbo.ProductVariants v ON v.ProductVariantId = r.ProductVariantId
      INNER JOIN dbo.Products p ON p.ProductId = v.ProductId
      WHERE r.InventoryReservationId = @reservationId;
    `);
  return result.recordset[0] ?? null;
}

export async function releaseReservation(reservationId, status = RESERVATION_STATUS.RELEASED) {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  try {
    const locked = await lockReservation(transaction, reservationId);
    if (!locked) {
      await transaction.rollback();
      return null;
    }
    if (locked.ReservationStatus !== RESERVATION_STATUS.ACTIVE) {
      await transaction.rollback();
      return { alreadyProcessed: true, reservation: locked };
    }

    await new sql.Request(transaction)
      .input('productVariantId', sql.UniqueIdentifier, locked.ProductVariantId)
      .input('quantity', sql.Int, locked.Quantity)
      .query(`
        UPDATE dbo.Inventory
        SET ReservedQuantity = CASE WHEN ReservedQuantity >= @quantity THEN ReservedQuantity - @quantity ELSE 0 END
        WHERE ProductVariantId = @productVariantId;
      `);

    const updated = await new sql.Request(transaction)
      .input('reservationId', sql.UniqueIdentifier, reservationId)
      .input('status', sql.VarChar(20), status)
      .query(`
        UPDATE dbo.InventoryReservations
        SET ReservationStatus = @status,
            ReleasedAtUtc = SYSUTCDATETIME(),
            UpdatedAtUtc = SYSUTCDATETIME()
        OUTPUT inserted.*
        WHERE InventoryReservationId = @reservationId;
      `);

    await transaction.commit();
    return { reservation: updated.recordset[0], alreadyProcessed: false };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function confirmReservation(reservationId, orderId, userId) {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  try {
    const locked = await lockReservation(transaction, reservationId);
    if (!locked) {
      await transaction.rollback();
      return null;
    }
    if (locked.ReservationStatus !== RESERVATION_STATUS.ACTIVE) {
      await transaction.rollback();
      return { alreadyProcessed: true, reservation: locked };
    }
    if (new Date(locked.ExpiresAtUtc) <= new Date()) {
      await transaction.rollback();
      return { expired: true, reservation: locked };
    }

    const inv = await new sql.Request(transaction)
      .input('productVariantId', sql.UniqueIdentifier, locked.ProductVariantId)
      .query(`
        SELECT ProductVariantId, OnHandQuantity, ReservedQuantity
        FROM dbo.Inventory WITH (UPDLOCK, ROWLOCK)
        WHERE ProductVariantId = @productVariantId;
      `);
    const row = inv.recordset[0];
    const previous = Number(row.OnHandQuantity);
    const next = previous - Number(locked.Quantity);
    if (next < 0) {
      await transaction.rollback();
      return { insufficientStock: true };
    }

    await new sql.Request(transaction)
      .input('productVariantId', sql.UniqueIdentifier, locked.ProductVariantId)
      .input('quantity', sql.Int, locked.Quantity)
      .query(`
        UPDATE dbo.Inventory
        SET OnHandQuantity = OnHandQuantity - @quantity,
            ReservedQuantity = ReservedQuantity - @quantity
        WHERE ProductVariantId = @productVariantId
          AND ReservedQuantity >= @quantity
          AND OnHandQuantity >= @quantity;
      `);

    const updated = await new sql.Request(transaction)
      .input('reservationId', sql.UniqueIdentifier, reservationId)
      .input('orderId', sql.UniqueIdentifier, orderId ?? locked.OrderId ?? null)
      .query(`
        UPDATE dbo.InventoryReservations
        SET ReservationStatus = 'CONFIRMED',
            OrderId = COALESCE(@orderId, OrderId),
            ConfirmedAtUtc = SYSUTCDATETIME(),
            UpdatedAtUtc = SYSUTCDATETIME()
        OUTPUT inserted.*
        WHERE InventoryReservationId = @reservationId;
      `);

    await insertMovement(transaction, {
      productVariantId: locked.ProductVariantId,
      movementType: MOVEMENT_TYPES.ORDER_DEDUCTION,
      quantityChange: -Number(locked.Quantity),
      previous,
      next,
      referenceType: 'InventoryReservation',
      referenceId: reservationId,
      notes: 'Reservation confirmed.',
      userId,
    });

    await transaction.commit();
    return { reservation: updated.recordset[0], alreadyProcessed: false };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function expireReservations(limit) {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  try {
    const result = await new sql.Request(transaction)
      .input('limit', sql.Int, limit)
      .query(`
        SELECT TOP (@limit) InventoryReservationId
        FROM dbo.InventoryReservations WITH (UPDLOCK, READPAST, ROWLOCK)
        WHERE ReservationStatus = 'ACTIVE' AND ExpiresAtUtc <= SYSUTCDATETIME()
        ORDER BY ExpiresAtUtc ASC;
      `);

    const expired = [];
    for (const row of result.recordset) {
      const released = await releaseReservationInsideTransaction(transaction, row.InventoryReservationId, RESERVATION_STATUS.EXPIRED);
      if (released) expired.push(released);
    }

    await transaction.commit();
    return expired;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function insertMovement(transaction, { productVariantId, movementType, quantityChange, previous, next, referenceType, referenceId, notes, userId, idempotencyKey }) {
  const result = await new sql.Request(transaction)
    .input('productVariantId', sql.UniqueIdentifier, productVariantId)
    .input('movementType', sql.VarChar(30), movementType)
    .input('quantityChange', sql.Int, quantityChange)
    .input('previous', sql.Int, previous)
    .input('next', sql.Int, next)
    .input('referenceType', sql.VarChar(50), referenceType ?? null)
    .input('referenceId', sql.UniqueIdentifier, referenceId ?? null)
    .input('notes', sql.NVarChar(500), notes ?? null)
    .input('userId', sql.UniqueIdentifier, userId ?? null)
    .input('idempotencyKey', sql.UniqueIdentifier, idempotencyKey ?? null)
    .query(`
      INSERT INTO dbo.InventoryMovements (
        ProductVariantId, MovementType, QuantityChange,
        PreviousOnHandQuantity, NewOnHandQuantity, ReferenceType, ReferenceId,
        Notes, CreatedByUserId, IdempotencyKey
      )
      OUTPUT inserted.*
      VALUES (
        @productVariantId, @movementType, @quantityChange,
        @previous, @next, @referenceType, @referenceId,
        @notes, @userId, @idempotencyKey
      );
    `);
  return result.recordset[0];
}

async function findReservationByIdempotencyKey(transaction, idempotencyKey) {
  if (!idempotencyKey) return null;
  const result = await new sql.Request(transaction)
    .input('idempotencyKey', sql.UniqueIdentifier, idempotencyKey)
    .query(`
      SELECT TOP 1 *
      FROM dbo.InventoryReservations
      WHERE IdempotencyKey = @idempotencyKey;
    `);
  return result.recordset[0] ?? null;
}

async function lockReservation(transaction, reservationId) {
  const result = await new sql.Request(transaction)
    .input('reservationId', sql.UniqueIdentifier, reservationId)
    .query(`
      SELECT *
      FROM dbo.InventoryReservations WITH (UPDLOCK, ROWLOCK)
      WHERE InventoryReservationId = @reservationId;
    `);
  return result.recordset[0] ?? null;
}

async function releaseReservationInsideTransaction(transaction, reservationId, status) {
  const locked = await lockReservation(transaction, reservationId);
  if (!locked || locked.ReservationStatus !== RESERVATION_STATUS.ACTIVE) return null;

  await new sql.Request(transaction)
    .input('productVariantId', sql.UniqueIdentifier, locked.ProductVariantId)
    .input('quantity', sql.Int, locked.Quantity)
    .query(`
      UPDATE dbo.Inventory
      SET ReservedQuantity = CASE WHEN ReservedQuantity >= @quantity THEN ReservedQuantity - @quantity ELSE 0 END
      WHERE ProductVariantId = @productVariantId;
    `);

  const updated = await new sql.Request(transaction)
    .input('reservationId', sql.UniqueIdentifier, reservationId)
    .input('status', sql.VarChar(20), status)
    .query(`
      UPDATE dbo.InventoryReservations
      SET ReservationStatus = @status,
          ReleasedAtUtc = SYSUTCDATETIME(),
          UpdatedAtUtc = SYSUTCDATETIME()
      OUTPUT inserted.*
      WHERE InventoryReservationId = @reservationId;
    `);
  return updated.recordset[0];
}
