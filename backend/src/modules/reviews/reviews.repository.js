import { randomUUID } from 'node:crypto';
import { getPool, sql } from '../../config/database.js';
import { AppError } from '../../common/errors/AppError.js';

function paging({ page, limit }) {
  return { limit, offset: (page - 1) * limit };
}

function orderBy(sort) {
  return {
    oldest: 'r.CreatedAtUtc ASC',
    highest: 'r.Rating DESC, r.CreatedAtUtc DESC',
    lowest: 'r.Rating ASC, r.CreatedAtUtc DESC',
    newest: 'r.CreatedAtUtc DESC',
  }[sort] || 'r.CreatedAtUtc DESC';
}

export async function listApproved(productId, query) {
  const pool = await getPool();
  const page = paging(query);
  const request = pool.request()
    .input('productId', sql.UniqueIdentifier, productId)
    .input('limit', sql.Int, page.limit)
    .input('offset', sql.Int, page.offset);
  if (query.rating) request.input('rating', sql.Int, query.rating);
  const result = await request.query(`
      SELECT r.ProductReviewId, r.ProductId, r.Rating, r.ReviewTitle, r.ReviewText, r.IsVerifiedPurchase, r.CreatedAtUtc,
        u.FirstName, u.LastName, COUNT(1) OVER() AS TotalRows
      FROM dbo.ProductReviews r
      INNER JOIN dbo.Users u ON u.UserId = r.UserId
      WHERE r.ProductId = @productId AND r.ReviewStatus IN ('APPROVED', 'Published')
        ${query.rating ? 'AND r.Rating=@rating' : ''}
      ORDER BY ${orderBy(query.sort)}
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
    `);
  return { rows: result.recordset.map(({ TotalRows, ...row }) => row), total: Number(result.recordset[0]?.TotalRows || 0) };
}

export async function summary(productId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('productId', sql.UniqueIdentifier, productId)
    .query(`
      SELECT COUNT(1) AS ReviewCount, COALESCE(AVG(CAST(Rating AS DECIMAL(4,2))), 0) AS AverageRating
      FROM dbo.ProductReviews
      WHERE ProductId = @productId AND ReviewStatus IN ('APPROVED', 'Published');
      SELECT Rating, COUNT(1) AS Count
      FROM dbo.ProductReviews
      WHERE ProductId = @productId AND ReviewStatus IN ('APPROVED', 'Published')
      GROUP BY Rating
      ORDER BY Rating DESC;
    `);
  return { ...(result.recordsets[0][0] || { ReviewCount: 0, AverageRating: 0 }), distribution: result.recordsets[1] };
}

export async function hasVerifiedPurchase({ userId, productId, orderItemId }) {
  const pool = await getPool();
  const request = pool.request()
    .input('userId', sql.UniqueIdentifier, userId)
    .input('productId', sql.UniqueIdentifier, productId);
  const itemFilter = orderItemId ? 'AND oi.OrderItemId = @orderItemId' : '';
  if (orderItemId) request.input('orderItemId', sql.BigInt, orderItemId);
  const result = await request.query(`
    SELECT TOP 1 oi.OrderItemId
    FROM dbo.OrderItems oi
    INNER JOIN dbo.Orders o ON o.OrderId = oi.OrderId
    INNER JOIN dbo.ProductVariants v ON v.ProductVariantId = oi.ProductVariantId
    WHERE o.UserId = @userId
      AND v.ProductId = @productId
      AND UPPER(o.OrderStatus) = 'DELIVERED'
      ${itemFilter};
  `);
  return result.recordset[0] ?? null;
}

export async function createReview({ userId, productId, input, verified }) {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  try {
  const existing = await new sql.Request(transaction).input('productId', sql.UniqueIdentifier, productId)
    .input('userId', sql.UniqueIdentifier, userId)
    .query('SELECT TOP 1 ProductReviewId FROM dbo.ProductReviews WITH (UPDLOCK, HOLDLOCK) WHERE ProductId=@productId AND UserId=@userId;');
  if (existing.recordset.length) throw new AppError(409, 'REVIEW_ALREADY_EXISTS', 'You have already reviewed this product. You can edit your review.');
  const result = await new sql.Request(transaction)
    .input('id', sql.UniqueIdentifier, randomUUID())
    .input('productId', sql.UniqueIdentifier, productId)
    .input('userId', sql.UniqueIdentifier, userId)
    .input('orderItemId', sql.BigInt, verified.OrderItemId)
    .input('rating', sql.Int, input.rating)
    .input('title', sql.NVarChar(150), input.title ?? null)
    .input('text', sql.NVarChar(2000), input.comment)
    .input('verified', sql.Bit, Boolean(verified))
    .query(`
      INSERT INTO dbo.ProductReviews (
        ProductReviewId, ProductId, UserId, OrderItemId, Rating, ReviewTitle, ReviewText, ReviewStatus, IsVerifiedPurchase
      )
      OUTPUT inserted.*
      VALUES (@id, @productId, @userId, @orderItemId, @rating, @title, @text, 'APPROVED', @verified);
    `);
  await transaction.commit();
  return result.recordset[0];
  } catch (error) { await transaction.rollback(); throw error; }
}

export async function findMineForProduct(userId, productId) {
  const pool = await getPool();
  const result = await pool.request().input('userId', sql.UniqueIdentifier, userId).input('productId', sql.UniqueIdentifier, productId)
    .query('SELECT TOP 1 * FROM dbo.ProductReviews WHERE UserId=@userId AND ProductId=@productId ORDER BY CreatedAtUtc DESC;');
  return result.recordset[0] ?? null;
}

export async function getReview(reviewId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('reviewId', sql.UniqueIdentifier, reviewId)
    .query('SELECT TOP 1 * FROM dbo.ProductReviews WHERE ProductReviewId = @reviewId;');
  return result.recordset[0] ?? null;
}

export async function listMine(userId, query) {
  const pool = await getPool();
  const page = paging(query);
  const result = await pool.request()
    .input('userId', sql.UniqueIdentifier, userId)
    .input('limit', sql.Int, page.limit)
    .input('offset', sql.Int, page.offset)
    .query(`
      SELECT r.*, p.ProductName, p.Slug AS ProductSlug, COUNT(1) OVER() AS TotalRows
      FROM dbo.ProductReviews r
      INNER JOIN dbo.Products p ON p.ProductId = r.ProductId
      WHERE r.UserId = @userId
      ORDER BY r.CreatedAtUtc DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
    `);
  return { rows: result.recordset.map(({ TotalRows, ...row }) => row), total: Number(result.recordset[0]?.TotalRows || 0) };
}

export async function updateMine({ reviewId, userId, input }) {
  const current = await getReview(reviewId);
  if (!current || current.UserId.toLowerCase() !== userId.toLowerCase()) return null;
  const pool = await getPool();
  const result = await pool.request()
    .input('reviewId', sql.UniqueIdentifier, reviewId)
    .input('rating', sql.Int, input.rating ?? current.Rating)
    .input('title', sql.NVarChar(150), input.title ?? current.ReviewTitle)
    .input('text', sql.NVarChar(2000), input.comment ?? current.ReviewText)
    .query(`
      UPDATE dbo.ProductReviews
      SET Rating = @rating, ReviewTitle = @title, ReviewText = @text, ReviewStatus = 'APPROVED',
        ModeratedByUserId = NULL, ModeratedAtUtc = NULL, UpdatedAtUtc = SYSUTCDATETIME()
      OUTPUT inserted.*
      WHERE ProductReviewId = @reviewId;
    `);
  return result.recordset[0] ?? null;
}

export async function deleteMine({ reviewId, userId }) {
  const pool = await getPool();
  const result = await pool.request()
    .input('reviewId', sql.UniqueIdentifier, reviewId)
    .input('userId', sql.UniqueIdentifier, userId)
    .query('DELETE FROM dbo.ProductReviews WHERE ProductReviewId = @reviewId AND UserId = @userId;');
  return result.rowsAffected[0] > 0;
}

export async function listAdmin(query) {
  const pool = await getPool();
  const page = paging(query);
  const request = pool.request().input('limit', sql.Int, page.limit).input('offset', sql.Int, page.offset);
  const where = ['1 = 1'];
  if (query.status) {
    request.input('status', sql.VarChar(30), query.status);
    where.push('r.ReviewStatus = @status');
  }
  const result = await request.query(`
    SELECT r.*, p.ProductName, u.Email, COUNT(1) OVER() AS TotalRows
    FROM dbo.ProductReviews r
    INNER JOIN dbo.Products p ON p.ProductId = r.ProductId
    INNER JOIN dbo.Users u ON u.UserId = r.UserId
    WHERE ${where.join(' AND ')}
    ORDER BY ${orderBy(query.sort)}, r.ProductReviewId DESC
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
  `);
  return { rows: result.recordset.map(({ TotalRows, ...row }) => row), total: Number(result.recordset[0]?.TotalRows || 0) };
}

export async function moderate({ reviewId, status, moderatorId }) {
  const pool = await getPool();
  const result = await pool.request()
    .input('reviewId', sql.UniqueIdentifier, reviewId)
    .input('status', sql.VarChar(30), status)
    .input('moderatorId', sql.UniqueIdentifier, moderatorId)
    .query(`
      UPDATE dbo.ProductReviews
      SET ReviewStatus = @status, ModeratedByUserId = @moderatorId, ModeratedAtUtc = SYSUTCDATETIME(), UpdatedAtUtc = SYSUTCDATETIME()
      OUTPUT inserted.*
      WHERE ProductReviewId = @reviewId;
    `);
  return result.recordset[0] ?? null;
}
