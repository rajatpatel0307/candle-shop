import { randomUUID } from 'node:crypto';
import { getPool, sql } from '../../config/database.js';
import { DEFAULT_WISHLIST_NAME } from './wishlists.constants.js';

export async function getOrCreateDefaultWishlist(userId) {
  const pool = await getPool();
  const existing = await pool.request()
    .input('userId', sql.UniqueIdentifier, userId)
    .input('name', sql.NVarChar(100), DEFAULT_WISHLIST_NAME)
    .query(`
      SELECT TOP 1 *
      FROM dbo.Wishlists
      WHERE UserId = @userId AND WishlistName = @name
      ORDER BY CreatedAtUtc;
    `);
  if (existing.recordset[0]) return existing.recordset[0];

  const inserted = await pool.request()
    .input('wishlistId', sql.UniqueIdentifier, randomUUID())
    .input('userId', sql.UniqueIdentifier, userId)
    .input('name', sql.NVarChar(100), DEFAULT_WISHLIST_NAME)
    .query(`
      INSERT INTO dbo.Wishlists (WishlistId, UserId, WishlistName)
      OUTPUT inserted.*
      VALUES (@wishlistId, @userId, @name);
    `);
  return inserted.recordset[0];
}

export async function findProductForWishlist({ productId, productVariantId }) {
  const pool = await getPool();
  const request = pool.request();
  const where = ['p.ProductId = @productId'];
  request.input('productId', sql.UniqueIdentifier, productId);
  if (productVariantId) {
    request.input('productVariantId', sql.UniqueIdentifier, productVariantId);
    where.push('v.ProductVariantId = @productVariantId');
  }
  const result = await request.query(`
    SELECT TOP 1
      p.ProductId, p.ProductName, p.Slug, p.ProductStatus,
      v.ProductVariantId, v.SKU, v.VariantName, v.SellingPrice, v.IsActive,
      COALESCE(inv.AvailableQuantity, 0) AS AvailableQuantity
    FROM dbo.Products p
    LEFT JOIN dbo.ProductVariants v ON v.ProductId = p.ProductId
      AND (@productVariantId IS NULL OR v.ProductVariantId = @productVariantId)
    LEFT JOIN dbo.Inventory inv ON inv.ProductVariantId = v.ProductVariantId
    WHERE ${where.join(' AND ')}
    ORDER BY v.SellingPrice ASC;
  `);
  return result.recordset[0] ?? null;
}

export async function listWishlistItems(wishlistId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('wishlistId', sql.UniqueIdentifier, wishlistId)
    .query(`
      SELECT
        wi.WishlistItemId, wi.WishlistId, wi.ProductId, wi.ProductVariantId, wi.AddedAtUtc,
        p.ProductName, p.Slug, p.ProductStatus,
        v.SKU, v.VariantName, v.SellingPrice, v.IsActive,
        COALESCE(inv.AvailableQuantity, 0) AS AvailableQuantity,
        img.ImageUrl
      FROM dbo.WishlistItems wi
      INNER JOIN dbo.Products p ON p.ProductId = wi.ProductId
      LEFT JOIN dbo.ProductVariants v ON v.ProductVariantId = wi.ProductVariantId
      LEFT JOIN dbo.Inventory inv ON inv.ProductVariantId = v.ProductVariantId
      OUTER APPLY (
        SELECT TOP 1 ImageUrl
        FROM dbo.ProductImages pi
        WHERE pi.ProductId = p.ProductId AND (pi.ProductVariantId IS NULL OR pi.ProductVariantId = wi.ProductVariantId)
        ORDER BY pi.IsPrimary DESC, pi.DisplayOrder ASC
      ) img
      WHERE wi.WishlistId = @wishlistId
      ORDER BY wi.AddedAtUtc DESC;
    `);
  return result.recordset;
}

export async function addWishlistItem({ wishlistId, productId, productVariantId }) {
  const pool = await getPool();
  const existing = await pool.request()
    .input('wishlistId', sql.UniqueIdentifier, wishlistId)
    .input('productId', sql.UniqueIdentifier, productId)
    .input('productVariantId', sql.UniqueIdentifier, productVariantId ?? null)
    .query(`
      SELECT TOP 1 *
      FROM dbo.WishlistItems
      WHERE WishlistId = @wishlistId
        AND ProductId = @productId
        AND (
          (ProductVariantId IS NULL AND @productVariantId IS NULL)
          OR ProductVariantId = @productVariantId
        );
    `);
  if (existing.recordset[0]) return existing.recordset[0];

  const inserted = await pool.request()
    .input('wishlistItemId', sql.UniqueIdentifier, randomUUID())
    .input('wishlistId', sql.UniqueIdentifier, wishlistId)
    .input('productId', sql.UniqueIdentifier, productId)
    .input('productVariantId', sql.UniqueIdentifier, productVariantId ?? null)
    .query(`
      INSERT INTO dbo.WishlistItems (WishlistItemId, WishlistId, ProductId, ProductVariantId)
      OUTPUT inserted.*
      VALUES (@wishlistItemId, @wishlistId, @productId, @productVariantId);
    `);
  return inserted.recordset[0];
}

export async function getWishlistItemForUser(userId, itemId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('userId', sql.UniqueIdentifier, userId)
    .input('itemId', sql.UniqueIdentifier, itemId)
    .query(`
      SELECT wi.*
      FROM dbo.WishlistItems wi
      INNER JOIN dbo.Wishlists w ON w.WishlistId = wi.WishlistId
      WHERE wi.WishlistItemId = @itemId AND w.UserId = @userId;
    `);
  return result.recordset[0] ?? null;
}

export async function removeWishlistItem({ userId, itemId }) {
  const pool = await getPool();
  const result = await pool.request()
    .input('userId', sql.UniqueIdentifier, userId)
    .input('itemId', sql.UniqueIdentifier, itemId)
    .query(`
      DELETE wi
      FROM dbo.WishlistItems wi
      INNER JOIN dbo.Wishlists w ON w.WishlistId = wi.WishlistId
      WHERE wi.WishlistItemId = @itemId AND w.UserId = @userId;
    `);
  return result.rowsAffected[0] > 0;
}

export async function removeByProduct({ userId, productId }) {
  const pool = await getPool();
  const result = await pool.request()
    .input('userId', sql.UniqueIdentifier, userId)
    .input('productId', sql.UniqueIdentifier, productId)
    .query(`
      DELETE wi
      FROM dbo.WishlistItems wi
      INNER JOIN dbo.Wishlists w ON w.WishlistId = wi.WishlistId
      WHERE wi.ProductId = @productId AND w.UserId = @userId;
    `);
  return result.rowsAffected[0];
}
