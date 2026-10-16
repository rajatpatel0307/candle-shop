import { getPool, sql } from '../../config/database.js';

export async function getHomeData() {
  const pool = await getPool();
  const [banners, categories, featured] = await Promise.all([
    pool.request().query(`
      SELECT TOP 5 BannerId, Title, Subtitle, ImageUrl, MobileImageUrl, TargetUrl
      FROM dbo.Banners
      WHERE IsActive = 1 AND (StartsAtUtc IS NULL OR StartsAtUtc <= SYSUTCDATETIME()) AND (EndsAtUtc IS NULL OR EndsAtUtc >= SYSUTCDATETIME())
      ORDER BY DisplayOrder, CreatedAtUtc DESC;
    `),
    pool.request().query(`
      SELECT TOP 8 CategoryId, CategoryName, Slug, Description, ImageUrl
      FROM dbo.Categories
      WHERE IsActive = 1
      ORDER BY DisplayOrder, CategoryName;
    `),
    pool.request().query(`
      SELECT TOP 8 p.ProductId, p.ProductName, p.Slug, p.ShortDescription, p.IsFeatured,
             MIN(v.SellingPrice) AS SellingPrice,
             MAX(i.ImageUrl) AS ImageUrl
      FROM dbo.Products p
      LEFT JOIN dbo.ProductVariants v ON v.ProductId = p.ProductId AND v.IsActive = 1
      LEFT JOIN dbo.ProductImages i ON i.ProductId = p.ProductId AND i.IsPrimary = 1
      WHERE p.ProductStatus = N'Active' AND p.IsFeatured = 1
      GROUP BY p.ProductId, p.ProductName, p.Slug, p.ShortDescription, p.IsFeatured
      ORDER BY p.ProductName;
    `),
  ]);

  return { banners: banners.recordset, categories: categories.recordset, featuredProducts: featured.recordset };
}

export async function listProducts({ search, category, fragrance, minPrice, maxPrice, sort, limit = 24, offset = 0 }) {
  const pool = await getPool();
  const request = pool.request();
  const where = ['p.ProductStatus = N\'Active\''];
  const sortOrders = { 'price-asc': 'MIN(v.SellingPrice) ASC, p.ProductName', 'price-desc': 'MIN(v.SellingPrice) DESC, p.ProductName', newest: 'MAX(p.CreatedAtUtc) DESC, p.ProductName', name: 'p.ProductName' };
  const orderBy = Object.hasOwn(sortOrders, sort) ? sortOrders[sort] : 'p.IsFeatured DESC, p.ProductName';

  if (search) {
    request.input('search', sql.NVarChar(300), `%${search}%`);
    where.push('(p.ProductName LIKE @search OR p.ShortDescription LIKE @search OR b.BrandName LIKE @search)');
  }
  if (category) {
    request.input('category', sql.NVarChar(150), category);
    where.push('c.Slug = @category');
  }
  if (fragrance) {
    request.input('fragrance', sql.NVarChar(150), fragrance);
    where.push('f.Slug = @fragrance');
  }
  if (minPrice) {
    request.input('minPrice', sql.Decimal(19, 4), Number(minPrice));
    where.push('v.SellingPrice >= @minPrice');
  }
  if (maxPrice) {
    request.input('maxPrice', sql.Decimal(19, 4), Number(maxPrice));
    where.push('v.SellingPrice <= @maxPrice');
  }

  request.input('limit', sql.Int, Math.min(Number(limit) || 24, 100));
  request.input('offset', sql.Int, Math.max(Number(offset) || 0, 0));

  const result = await request.query(`
    SELECT p.ProductId, p.ProductName, p.Slug, p.ShortDescription, p.ProductType, p.IsFeatured,
           c.CategoryName, c.Slug AS CategorySlug, b.BrandName,
           MIN(v.SellingPrice) AS SellingPrice,
           MAX(v.CompareAtPrice) AS CompareAtPrice,
           MAX(i.ImageUrl) AS ImageUrl
    FROM dbo.Products p
    INNER JOIN dbo.Categories c ON c.CategoryId = p.CategoryId
    LEFT JOIN dbo.Brands b ON b.BrandId = p.BrandId
    LEFT JOIN dbo.ProductVariants v ON v.ProductId = p.ProductId AND v.IsActive = 1
    LEFT JOIN dbo.Fragrances f ON f.FragranceId = v.FragranceId
    LEFT JOIN dbo.ProductImages i ON i.ProductId = p.ProductId AND i.IsPrimary = 1
    WHERE ${where.join(' AND ')}
    GROUP BY p.ProductId, p.ProductName, p.Slug, p.ShortDescription, p.ProductType, p.IsFeatured, c.CategoryName, c.Slug, b.BrandName
    ORDER BY ${orderBy}, p.ProductId
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
  `);

  return result.recordset;
}

export async function getProduct(slug) {
  const pool = await getPool();
  const request = pool.request();
  request.input('slug', sql.NVarChar(220), slug);

  const product = await request.query(`
    SELECT p.*, c.CategoryName, c.Slug AS CategorySlug, b.BrandName
    FROM dbo.Products p
    INNER JOIN dbo.Categories c ON c.CategoryId = p.CategoryId
    LEFT JOIN dbo.Brands b ON b.BrandId = p.BrandId
    WHERE p.Slug = @slug AND p.ProductStatus = N'Active';
  `);
  const row = product.recordset[0];
  if (!row) return null;

  const detailRequest = pool.request();
  detailRequest.input('productId', sql.UniqueIdentifier, row.ProductId);
  const [variants, images, specs, reviews] = await Promise.all([
    detailRequest.query(`
      SELECT v.ProductVariantId, v.SKU, v.VariantName, v.SizeValue, v.SizeUnit, v.ColorName, v.Material, v.BurnTimeHours,
             v.SellingPrice, v.CompareAtPrice, v.WeightGrams, f.FragranceName, f.ScentFamily,
             inv.AvailableQuantity
      FROM dbo.ProductVariants v
      LEFT JOIN dbo.Fragrances f ON f.FragranceId = v.FragranceId
      LEFT JOIN dbo.Inventory inv ON inv.ProductVariantId = v.ProductVariantId
      WHERE v.ProductId = @productId AND v.IsActive = 1
      ORDER BY v.SellingPrice;
    `),
    pool.request().input('productId', sql.UniqueIdentifier, row.ProductId).query(`
      SELECT ProductVariantId, ImageUrl, AltText, DisplayOrder, IsPrimary FROM dbo.ProductImages WHERE ProductId = @productId ORDER BY IsPrimary DESC, DisplayOrder;
    `),
    pool.request().input('productId', sql.UniqueIdentifier, row.ProductId).query(`
      SELECT SpecificationName, SpecificationValue FROM dbo.ProductSpecifications WHERE ProductId = @productId ORDER BY DisplayOrder;
    `),
    pool.request().input('productId', sql.UniqueIdentifier, row.ProductId).query(`
      SELECT TOP 8 Rating, ReviewTitle, ReviewText, CreatedAtUtc FROM dbo.ProductReviews WHERE ProductId = @productId AND ReviewStatus IN ('APPROVED', 'Published') ORDER BY CreatedAtUtc DESC;
    `),
  ]);

  return { ...row, variants: variants.recordset, images: images.recordset, specifications: specs.recordset, reviews: reviews.recordset };
}

export async function listCategories() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT CategoryId, ParentCategoryId, CategoryName, Slug, Description, ImageUrl
    FROM dbo.Categories
    WHERE IsActive = 1
    ORDER BY DisplayOrder, CategoryName;
  `);
  return result.recordset;
}

export async function createContactMessage(body) {
  const pool = await getPool();
  const request = pool.request();
  request.input('name', sql.NVarChar(200), body.name);
  request.input('email', sql.NVarChar(320), body.email);
  request.input('subject', sql.NVarChar(200), body.subject ?? null);
  request.input('message', sql.NVarChar(4000), body.message);
  const result = await request.query(`
    INSERT INTO dbo.ContactMessages (Name, Email, Subject, Message)
    OUTPUT inserted.ContactMessageId, inserted.MessageStatus, inserted.CreatedAtUtc
    VALUES (@name, @email, @subject, @message);
  `);
  return result.recordset[0];
}
