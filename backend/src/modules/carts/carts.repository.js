import { randomUUID } from 'node:crypto';
import { getPool, sql } from '../../config/database.js';
import { CART_STATUS, DEFAULT_CURRENCY } from './carts.constants.js';

export async function getOrCreateActiveCart(userId) {
  const pool = await getPool();
  const existing = await pool.request()
    .input('userId', sql.UniqueIdentifier, userId)
    .input('status', sql.NVarChar(20), CART_STATUS.ACTIVE)
    .query(`
      SELECT TOP 1 *
      FROM dbo.Carts
      WHERE UserId = @userId AND CartStatus = @status
      ORDER BY UpdatedAtUtc DESC;
    `);
  if (existing.recordset[0]) return existing.recordset[0];

  const cartId = randomUUID();
  const inserted = await pool.request()
    .input('cartId', sql.UniqueIdentifier, cartId)
    .input('userId', sql.UniqueIdentifier, userId)
    .input('currency', sql.Char(3), DEFAULT_CURRENCY)
    .input('status', sql.NVarChar(20), CART_STATUS.ACTIVE)
    .query(`
      INSERT INTO dbo.Carts (CartId, UserId, CurrencyCode, CartStatus)
      OUTPUT inserted.*
      VALUES (@cartId, @userId, @currency, @status);
    `);
  return inserted.recordset[0];
}

export async function findSellableVariant({ productId, productVariantId }) {
  const pool = await getPool();
  const request = pool.request();
  const where = ["p.ProductStatus = N'Active'", 'v.IsActive = 1'];
  if (productVariantId) {
    request.input('productVariantId', sql.UniqueIdentifier, productVariantId);
    where.push('v.ProductVariantId = @productVariantId');
  }
  if (productId) {
    request.input('productId', sql.UniqueIdentifier, productId);
    where.push('p.ProductId = @productId');
  }
  const result = await request.query(`
    SELECT TOP 1
      p.ProductId, p.ProductName, p.Slug, p.ProductStatus,
      v.ProductVariantId, v.SKU, v.VariantName, v.SellingPrice, v.IsActive,
      COALESCE(inv.AvailableQuantity, 0) AS AvailableQuantity
    FROM dbo.ProductVariants v
    INNER JOIN dbo.Products p ON p.ProductId = v.ProductId
    LEFT JOIN dbo.Inventory inv ON inv.ProductVariantId = v.ProductVariantId
    WHERE ${where.join(' AND ')}
    ORDER BY v.SellingPrice ASC;
  `);
  return result.recordset[0] ?? null;
}

export async function getExistingCartItem(cartId, productVariantId, transaction = null) {
  const request = transaction ? new sql.Request(transaction) : (await getPool()).request();
  const result = await request
    .input('cartId', sql.UniqueIdentifier, cartId)
    .input('productVariantId', sql.UniqueIdentifier, productVariantId)
    .query(`
      SELECT TOP 1 *
      FROM dbo.CartItems
      WHERE CartId = @cartId AND ProductVariantId = @productVariantId;
    `);
  return result.recordset[0] ?? null;
}

export async function upsertCartItem({ cartId, productVariantId, quantity }) {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  try {
    const existing = await getExistingCartItem(cartId, productVariantId, transaction);
    if (existing) {
      await new sql.Request(transaction)
        .input('cartItemId', sql.BigInt, existing.CartItemId)
        .input('quantity', sql.Int, quantity)
        .query(`
          UPDATE dbo.CartItems
          SET Quantity = Quantity + @quantity,
              UpdatedAtUtc = SYSUTCDATETIME()
          WHERE CartItemId = @cartItemId;
        `);
    } else {
      await new sql.Request(transaction)
        .input('cartId', sql.UniqueIdentifier, cartId)
        .input('productVariantId', sql.UniqueIdentifier, productVariantId)
        .input('quantity', sql.Int, quantity)
        .query(`
          INSERT INTO dbo.CartItems (CartId, ProductVariantId, Quantity)
          VALUES (@cartId, @productVariantId, @quantity);
        `);
    }

    await new sql.Request(transaction)
      .input('cartId', sql.UniqueIdentifier, cartId)
      .query('UPDATE dbo.Carts SET UpdatedAtUtc = SYSUTCDATETIME() WHERE CartId = @cartId;');

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function updateCartItemQuantity({ userId, itemId, quantity }) {
  const pool = await getPool();
  const result = await pool.request()
    .input('userId', sql.UniqueIdentifier, userId)
    .input('itemId', sql.BigInt, itemId)
    .input('quantity', sql.Int, quantity)
    .query(`
      UPDATE ci
      SET Quantity = @quantity,
          UpdatedAtUtc = SYSUTCDATETIME()
      FROM dbo.CartItems ci
      INNER JOIN dbo.Carts c ON c.CartId = ci.CartId
      WHERE ci.CartItemId = @itemId
        AND c.UserId = @userId
        AND c.CartStatus = N'Active';
    `);
  return result.rowsAffected[0] > 0;
}

export async function removeCartItem({ userId, itemId }) {
  const pool = await getPool();
  const result = await pool.request()
    .input('userId', sql.UniqueIdentifier, userId)
    .input('itemId', sql.BigInt, itemId)
    .query(`
      DELETE ci
      FROM dbo.CartItems ci
      INNER JOIN dbo.Carts c ON c.CartId = ci.CartId
      WHERE ci.CartItemId = @itemId
        AND c.UserId = @userId
        AND c.CartStatus = N'Active';
    `);
  return result.rowsAffected[0] > 0;
}

export async function clearCart(userId) {
  const pool = await getPool();
  await pool.request()
    .input('userId', sql.UniqueIdentifier, userId)
    .query(`
      DELETE ci
      FROM dbo.CartItems ci
      INNER JOIN dbo.Carts c ON c.CartId = ci.CartId
      WHERE c.UserId = @userId AND c.CartStatus = N'Active';
    `);
}

export async function listCartItems(cartId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('cartId', sql.UniqueIdentifier, cartId)
    .query(`
      SELECT
        ci.CartItemId, ci.CartId, ci.ProductVariantId, ci.Quantity, ci.UpdatedAtUtc,
        p.ProductId, p.ProductName, p.Slug, p.ProductStatus,
        v.SKU, v.VariantName, v.SellingPrice, v.IsActive,
        COALESCE(inv.AvailableQuantity, 0) AS AvailableQuantity,
        img.ImageUrl
      FROM dbo.CartItems ci
      INNER JOIN dbo.ProductVariants v ON v.ProductVariantId = ci.ProductVariantId
      INNER JOIN dbo.Products p ON p.ProductId = v.ProductId
      LEFT JOIN dbo.Inventory inv ON inv.ProductVariantId = v.ProductVariantId
      OUTER APPLY (
        SELECT TOP 1 ImageUrl
        FROM dbo.ProductImages pi
        WHERE pi.ProductId = p.ProductId AND (pi.ProductVariantId IS NULL OR pi.ProductVariantId = v.ProductVariantId)
        ORDER BY pi.IsPrimary DESC, pi.DisplayOrder ASC
      ) img
      WHERE ci.CartId = @cartId
      ORDER BY ci.UpdatedAtUtc DESC;
    `);
  return result.recordset;
}
