import { randomUUID } from 'node:crypto';
import { getPool, sql } from '../../config/database.js';
import { DEFAULT_SECTION_KEY } from './content.constants.js';

function pagination({ page = 1, limit = 20 }) {
  return { limit: Math.min(Number(limit) || 20, 100), offset: (Math.max(Number(page) || 1, 1) - 1) * Math.min(Number(limit) || 20, 100) };
}

function mapSchedule(row) {
  return {
    startAtUtc: row.StartAtUtc,
    endAtUtc: row.EndAtUtc,
    createdAtUtc: row.CreatedAtUtc,
    updatedAtUtc: row.UpdatedAtUtc,
  };
}

function bannerRow(row) {
  return {
    id: row.HomepageBannerId,
    title: row.Title,
    subtitle: row.Subtitle,
    description: row.Description,
    desktopImageUrl: row.DesktopImageUrl,
    mobileImageUrl: row.MobileImageUrl,
    altText: row.AltText,
    buttonText: row.ButtonText,
    buttonUrl: row.ButtonUrl,
    secondaryButtonText: row.SecondaryButtonText,
    secondaryButtonUrl: row.SecondaryButtonUrl,
    displayOrder: row.DisplayOrder,
    status: row.BannerStatus,
    ...mapSchedule(row),
  };
}

function promotionRow(row) {
  return {
    id: row.PromotionalSectionId,
    title: row.Title,
    subtitle: row.Subtitle,
    description: row.Description,
    imageUrl: row.ImageUrl,
    backgroundImageUrl: row.BackgroundImageUrl,
    layoutType: row.LayoutType,
    buttonText: row.ButtonText,
    buttonUrl: row.ButtonUrl,
    displayOrder: row.DisplayOrder,
    status: row.SectionStatus,
    ...mapSchedule(row),
  };
}

function pageRow(row) {
  return {
    id: row.ContentPageId,
    title: row.Title,
    slug: row.Slug,
    pageType: row.PageType,
    summary: row.Summary,
    content: row.Content,
    contentFormat: row.ContentFormat,
    status: row.PageStatus,
    publishedAtUtc: row.PublishedAtUtc,
    createdAtUtc: row.CreatedAtUtc,
    updatedAtUtc: row.UpdatedAtUtc,
  };
}

function seoRow(row) {
  return {
    id: row.SeoMetadataId,
    entityType: row.EntityType,
    entityId: row.EntityId,
    path: row.Path,
    metaTitle: row.MetaTitle,
    metaDescription: row.MetaDescription,
    canonicalUrl: row.CanonicalUrl,
    robotsDirective: row.RobotsDirective,
    ogTitle: row.OgTitle,
    ogDescription: row.OgDescription,
    ogImageUrl: row.OgImageUrl,
    createdAtUtc: row.CreatedAtUtc,
    updatedAtUtc: row.UpdatedAtUtc,
  };
}

function featuredRow(row) {
  return {
    id: row.FeaturedProductId,
    productId: row.ProductId,
    sectionKey: row.SectionKey,
    displayOrder: row.DisplayOrder,
    status: row.FeaturedStatus,
    startAtUtc: row.StartAtUtc,
    endAtUtc: row.EndAtUtc,
    productName: row.ProductName,
    slug: row.Slug,
    shortDescription: row.ShortDescription,
    categoryName: row.CategoryName,
    sellingPrice: row.SellingPrice,
    compareAtPrice: row.CompareAtPrice,
    imageUrl: row.ImageUrl,
  };
}

export async function listPublicBanners() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT * FROM dbo.HomepageBanners
    WHERE BannerStatus = 'PUBLISHED'
      AND (StartAtUtc IS NULL OR StartAtUtc <= SYSUTCDATETIME())
      AND (EndAtUtc IS NULL OR EndAtUtc >= SYSUTCDATETIME())
    ORDER BY DisplayOrder, CreatedAtUtc DESC;
  `);
  return result.recordset.map(bannerRow);
}

export async function listPublicPromotions() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT * FROM dbo.PromotionalSections
    WHERE SectionStatus = 'PUBLISHED'
      AND (StartAtUtc IS NULL OR StartAtUtc <= SYSUTCDATETIME())
      AND (EndAtUtc IS NULL OR EndAtUtc >= SYSUTCDATETIME())
    ORDER BY DisplayOrder, CreatedAtUtc DESC;
  `);
  return result.recordset.map(promotionRow);
}

export async function listPublicFeatured(sectionKey = DEFAULT_SECTION_KEY) {
  const pool = await getPool();
  const result = await pool.request().input('sectionKey', sql.NVarChar(80), sectionKey).query(`
    SELECT fp.*, p.ProductName, p.Slug, p.ShortDescription, c.CategoryName,
           MIN(v.SellingPrice) AS SellingPrice,
           MAX(v.CompareAtPrice) AS CompareAtPrice,
           MAX(i.ImageUrl) AS ImageUrl
    FROM dbo.FeaturedProducts fp
    INNER JOIN dbo.Products p ON p.ProductId = fp.ProductId
    INNER JOIN dbo.Categories c ON c.CategoryId = p.CategoryId
    LEFT JOIN dbo.ProductVariants v ON v.ProductId = p.ProductId AND v.IsActive = 1
    LEFT JOIN dbo.ProductImages i ON i.ProductId = p.ProductId AND i.IsPrimary = 1
    WHERE fp.SectionKey = @sectionKey
      AND fp.FeaturedStatus = 'PUBLISHED'
      AND p.ProductStatus = N'Active'
      AND (fp.StartAtUtc IS NULL OR fp.StartAtUtc <= SYSUTCDATETIME())
      AND (fp.EndAtUtc IS NULL OR fp.EndAtUtc >= SYSUTCDATETIME())
    GROUP BY fp.FeaturedProductId, fp.ProductId, fp.SectionKey, fp.DisplayOrder, fp.FeaturedStatus, fp.StartAtUtc, fp.EndAtUtc,
             fp.CreatedByUserId, fp.UpdatedByUserId, fp.CreatedAtUtc, fp.UpdatedAtUtc,
             p.ProductName, p.Slug, p.ShortDescription, c.CategoryName
    ORDER BY fp.DisplayOrder, p.ProductName;
  `);
  return result.recordset.map(featuredRow);
}

export async function getPublicPage(slug) {
  const pool = await getPool();
  const result = await pool.request().input('slug', sql.NVarChar(180), slug).query(`
    SELECT TOP 1 * FROM dbo.ContentPages
    WHERE Slug = @slug AND PageStatus = 'PUBLISHED' AND (PublishedAtUtc IS NULL OR PublishedAtUtc <= SYSUTCDATETIME());
  `);
  return result.recordset[0] ? pageRow(result.recordset[0]) : null;
}

export async function resolveSeo({ path, entityType, entityId }) {
  const pool = await getPool();
  const request = pool.request();
  if (path) {
    request.input('path', sql.NVarChar(500), path);
    const byPath = await request.query('SELECT TOP 1 * FROM dbo.SeoMetadata WHERE Path = @path;');
    if (byPath.recordset[0]) return seoRow(byPath.recordset[0]);
  }
  if (entityType && entityId) {
    const byEntity = await pool.request()
      .input('type', sql.VarChar(40), entityType)
      .input('id', sql.UniqueIdentifier, entityId)
      .query('SELECT TOP 1 * FROM dbo.SeoMetadata WHERE EntityType = @type AND EntityId = @id;');
    if (byEntity.recordset[0]) return seoRow(byEntity.recordset[0]);
  }
  return null;
}

async function listTable({ table, statusColumn, mapper, query }) {
  const pool = await getPool();
  const { limit, offset } = pagination(query);
  const request = pool.request().input('limit', sql.Int, limit).input('offset', sql.Int, offset);
  const where = [];
  if (query.status) {
    request.input('status', sql.VarChar(30), query.status);
    where.push(`${statusColumn} = @status`);
  }
  if (query.search) {
    request.input('search', sql.NVarChar(220), `%${query.search}%`);
    where.push('(Title LIKE @search)');
  }
  const result = await request.query(`
    SELECT *, COUNT(1) OVER() AS TotalRows FROM dbo.${table}
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY DisplayOrder, CreatedAtUtc DESC
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
  `);
  return { rows: result.recordset.map(({ TotalRows, ...row }) => mapper(row)), total: Number(result.recordset[0]?.TotalRows || 0) };
}

export const listAdminBanners = (query) => listTable({ table: 'HomepageBanners', statusColumn: 'BannerStatus', mapper: bannerRow, query });
export const listAdminPromotions = (query) => listTable({ table: 'PromotionalSections', statusColumn: 'SectionStatus', mapper: promotionRow, query });

export async function listAdminPages(query) {
  const pool = await getPool();
  const { limit, offset } = pagination(query);
  const request = pool.request().input('limit', sql.Int, limit).input('offset', sql.Int, offset);
  const where = [];
  if (query.status) {
    request.input('status', sql.VarChar(30), query.status);
    where.push('PageStatus = @status');
  }
  if (query.search) {
    request.input('search', sql.NVarChar(220), `%${query.search}%`);
    where.push('(Title LIKE @search OR Slug LIKE @search)');
  }
  const result = await request.query(`
    SELECT *, COUNT(1) OVER() AS TotalRows FROM dbo.ContentPages
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY UpdatedAtUtc DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
  `);
  return { rows: result.recordset.map(({ TotalRows, ...row }) => pageRow(row)), total: Number(result.recordset[0]?.TotalRows || 0) };
}

export async function getAdminPage(id) {
  const pool = await getPool();
  const result = await pool.request().input('id', sql.UniqueIdentifier, id).query('SELECT TOP 1 * FROM dbo.ContentPages WHERE ContentPageId = @id;');
  return result.recordset[0] ? pageRow(result.recordset[0]) : null;
}

export async function listRevisions(pageId) {
  const pool = await getPool();
  const result = await pool.request().input('id', sql.UniqueIdentifier, pageId).query('SELECT * FROM dbo.ContentPageRevisions WHERE ContentPageId = @id ORDER BY CreatedAtUtc DESC;');
  return result.recordset;
}

export async function createBanner(input, userId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.UniqueIdentifier, randomUUID()).input('title', sql.NVarChar(200), input.title)
    .input('subtitle', sql.NVarChar(300), input.subtitle ?? null).input('description', sql.NVarChar(1000), input.description ?? null)
    .input('desktopImageUrl', sql.NVarChar(1000), input.desktopImageUrl ?? null).input('mobileImageUrl', sql.NVarChar(1000), input.mobileImageUrl ?? null)
    .input('altText', sql.NVarChar(250), input.altText ?? null).input('buttonText', sql.NVarChar(80), input.buttonText ?? null)
    .input('buttonUrl', sql.NVarChar(1000), input.buttonUrl ?? null).input('secondaryButtonText', sql.NVarChar(80), input.secondaryButtonText ?? null)
    .input('secondaryButtonUrl', sql.NVarChar(1000), input.secondaryButtonUrl ?? null).input('displayOrder', sql.Int, input.displayOrder)
    .input('status', sql.VarChar(30), input.status).input('startAt', sql.DateTime2, input.startAtUtc ?? null).input('endAt', sql.DateTime2, input.endAtUtc ?? null)
    .input('userId', sql.UniqueIdentifier, userId ?? null)
    .query(`INSERT INTO dbo.HomepageBanners (HomepageBannerId, Title, Subtitle, Description, DesktopImageUrl, MobileImageUrl, AltText, ButtonText, ButtonUrl, SecondaryButtonText, SecondaryButtonUrl, DisplayOrder, BannerStatus, StartAtUtc, EndAtUtc, CreatedByUserId, UpdatedByUserId)
      OUTPUT inserted.* VALUES (@id, @title, @subtitle, @description, @desktopImageUrl, @mobileImageUrl, @altText, @buttonText, @buttonUrl, @secondaryButtonText, @secondaryButtonUrl, @displayOrder, @status, @startAt, @endAt, @userId, @userId);`);
  return bannerRow(result.recordset[0]);
}

export async function updateBanner(id, input, userId) {
  const current = await getById('HomepageBanners', 'HomepageBannerId', id, bannerRow);
  if (!current) return null;
  const next = { ...current, ...input };
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.UniqueIdentifier, id).input('title', sql.NVarChar(200), next.title)
    .input('subtitle', sql.NVarChar(300), next.subtitle ?? null).input('description', sql.NVarChar(1000), next.description ?? null)
    .input('desktopImageUrl', sql.NVarChar(1000), next.desktopImageUrl ?? null).input('mobileImageUrl', sql.NVarChar(1000), next.mobileImageUrl ?? null)
    .input('altText', sql.NVarChar(250), next.altText ?? null).input('buttonText', sql.NVarChar(80), next.buttonText ?? null)
    .input('buttonUrl', sql.NVarChar(1000), next.buttonUrl ?? null).input('secondaryButtonText', sql.NVarChar(80), next.secondaryButtonText ?? null)
    .input('secondaryButtonUrl', sql.NVarChar(1000), next.secondaryButtonUrl ?? null).input('displayOrder', sql.Int, next.displayOrder)
    .input('status', sql.VarChar(30), next.status).input('startAt', sql.DateTime2, next.startAtUtc ?? null).input('endAt', sql.DateTime2, next.endAtUtc ?? null)
    .input('userId', sql.UniqueIdentifier, userId ?? null)
    .query(`UPDATE dbo.HomepageBanners SET Title=@title, Subtitle=@subtitle, Description=@description, DesktopImageUrl=@desktopImageUrl, MobileImageUrl=@mobileImageUrl, AltText=@altText, ButtonText=@buttonText, ButtonUrl=@buttonUrl, SecondaryButtonText=@secondaryButtonText, SecondaryButtonUrl=@secondaryButtonUrl, DisplayOrder=@displayOrder, BannerStatus=@status, StartAtUtc=@startAt, EndAtUtc=@endAt, UpdatedByUserId=@userId, UpdatedAtUtc=SYSUTCDATETIME() OUTPUT inserted.* WHERE HomepageBannerId=@id;`);
  return bannerRow(result.recordset[0]);
}

async function getById(table, column, id, mapper) {
  const pool = await getPool();
  const result = await pool.request().input('id', sql.UniqueIdentifier, id).query(`SELECT TOP 1 * FROM dbo.${table} WHERE ${column} = @id;`);
  return result.recordset[0] ? mapper(result.recordset[0]) : null;
}

export const getAdminBanner = (id) => getById('HomepageBanners', 'HomepageBannerId', id, bannerRow);
export const getAdminPromotion = (id) => getById('PromotionalSections', 'PromotionalSectionId', id, promotionRow);

export async function deleteOrArchive(table, column, statusColumn, id) {
  const pool = await getPool();
  const result = await pool.request().input('id', sql.UniqueIdentifier, id).query(`UPDATE dbo.${table} SET ${statusColumn} = 'ARCHIVED', UpdatedAtUtc = SYSUTCDATETIME() WHERE ${column} = @id;`);
  return result.rowsAffected[0] > 0;
}

export async function createPromotion(input, userId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.UniqueIdentifier, randomUUID()).input('title', sql.NVarChar(200), input.title)
    .input('subtitle', sql.NVarChar(300), input.subtitle ?? null).input('description', sql.NVarChar(1500), input.description ?? null)
    .input('imageUrl', sql.NVarChar(1000), input.imageUrl ?? null).input('backgroundImageUrl', sql.NVarChar(1000), input.backgroundImageUrl ?? null)
    .input('layoutType', sql.VarChar(40), input.layoutType).input('buttonText', sql.NVarChar(80), input.buttonText ?? null)
    .input('buttonUrl', sql.NVarChar(1000), input.buttonUrl ?? null).input('displayOrder', sql.Int, input.displayOrder)
    .input('status', sql.VarChar(30), input.status).input('startAt', sql.DateTime2, input.startAtUtc ?? null).input('endAt', sql.DateTime2, input.endAtUtc ?? null)
    .input('userId', sql.UniqueIdentifier, userId ?? null)
    .query(`INSERT INTO dbo.PromotionalSections (PromotionalSectionId, Title, Subtitle, Description, ImageUrl, BackgroundImageUrl, LayoutType, ButtonText, ButtonUrl, DisplayOrder, SectionStatus, StartAtUtc, EndAtUtc, CreatedByUserId, UpdatedByUserId)
      OUTPUT inserted.* VALUES (@id, @title, @subtitle, @description, @imageUrl, @backgroundImageUrl, @layoutType, @buttonText, @buttonUrl, @displayOrder, @status, @startAt, @endAt, @userId, @userId);`);
  return promotionRow(result.recordset[0]);
}

export async function updatePromotion(id, input, userId) {
  const current = await getAdminPromotion(id);
  if (!current) return null;
  const next = { ...current, ...input };
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.UniqueIdentifier, id).input('title', sql.NVarChar(200), next.title)
    .input('subtitle', sql.NVarChar(300), next.subtitle ?? null).input('description', sql.NVarChar(1500), next.description ?? null)
    .input('imageUrl', sql.NVarChar(1000), next.imageUrl ?? null).input('backgroundImageUrl', sql.NVarChar(1000), next.backgroundImageUrl ?? null)
    .input('layoutType', sql.VarChar(40), next.layoutType).input('buttonText', sql.NVarChar(80), next.buttonText ?? null)
    .input('buttonUrl', sql.NVarChar(1000), next.buttonUrl ?? null).input('displayOrder', sql.Int, next.displayOrder)
    .input('status', sql.VarChar(30), next.status).input('startAt', sql.DateTime2, next.startAtUtc ?? null).input('endAt', sql.DateTime2, next.endAtUtc ?? null)
    .input('userId', sql.UniqueIdentifier, userId ?? null)
    .query(`UPDATE dbo.PromotionalSections SET Title=@title, Subtitle=@subtitle, Description=@description, ImageUrl=@imageUrl, BackgroundImageUrl=@backgroundImageUrl, LayoutType=@layoutType, ButtonText=@buttonText, ButtonUrl=@buttonUrl, DisplayOrder=@displayOrder, SectionStatus=@status, StartAtUtc=@startAt, EndAtUtc=@endAt, UpdatedByUserId=@userId, UpdatedAtUtc=SYSUTCDATETIME() OUTPUT inserted.* WHERE PromotionalSectionId=@id;`);
  return promotionRow(result.recordset[0]);
}

export async function createPage(input, userId) {
  const pool = await getPool();
  const id = randomUUID();
  const result = await pool.request()
    .input('id', sql.UniqueIdentifier, id).input('title', sql.NVarChar(200), input.title).input('slug', sql.NVarChar(180), input.slug)
    .input('type', sql.VarChar(40), input.pageType).input('summary', sql.NVarChar(500), input.summary ?? null).input('content', sql.NVarChar(sql.MAX), input.content)
    .input('format', sql.VarChar(30), input.contentFormat).input('status', sql.VarChar(30), input.status).input('publishedAt', sql.DateTime2, input.publishedAtUtc ?? (input.status === 'PUBLISHED' ? new Date() : null))
    .input('userId', sql.UniqueIdentifier, userId ?? null)
    .query(`INSERT INTO dbo.ContentPages (ContentPageId, Title, Slug, PageType, Summary, Content, ContentFormat, PageStatus, PublishedAtUtc, CreatedByUserId, UpdatedByUserId)
      OUTPUT inserted.* VALUES (@id, @title, @slug, @type, @summary, @content, @format, @status, @publishedAt, @userId, @userId);`);
  await insertRevision(id, input, userId, 'Initial version');
  return pageRow(result.recordset[0]);
}

async function insertRevision(pageId, input, userId, note) {
  const pool = await getPool();
  await pool.request()
    .input('id', sql.UniqueIdentifier, randomUUID()).input('pageId', sql.UniqueIdentifier, pageId).input('title', sql.NVarChar(200), input.title)
    .input('slug', sql.NVarChar(180), input.slug).input('summary', sql.NVarChar(500), input.summary ?? null).input('content', sql.NVarChar(sql.MAX), input.content)
    .input('format', sql.VarChar(30), input.contentFormat).input('status', sql.VarChar(30), input.status).input('note', sql.NVarChar(500), input.revisionNote ?? note ?? null)
    .input('userId', sql.UniqueIdentifier, userId ?? null)
    .query(`INSERT INTO dbo.ContentPageRevisions (ContentPageRevisionId, ContentPageId, Title, Slug, Summary, Content, ContentFormat, PageStatus, RevisionNote, CreatedByUserId)
      VALUES (@id, @pageId, @title, @slug, @summary, @content, @format, @status, @note, @userId);`);
}

export async function updatePage(id, input, userId) {
  const current = await getAdminPage(id);
  if (!current) return null;
  const next = { ...current, ...input };
  const publishedAt = input.status === 'PUBLISHED' && !current.publishedAtUtc ? new Date() : next.publishedAtUtc;
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.UniqueIdentifier, id).input('title', sql.NVarChar(200), next.title).input('slug', sql.NVarChar(180), next.slug)
    .input('type', sql.VarChar(40), next.pageType).input('summary', sql.NVarChar(500), next.summary ?? null).input('content', sql.NVarChar(sql.MAX), next.content)
    .input('format', sql.VarChar(30), next.contentFormat).input('status', sql.VarChar(30), next.status).input('publishedAt', sql.DateTime2, publishedAt ?? null)
    .input('userId', sql.UniqueIdentifier, userId ?? null)
    .query(`UPDATE dbo.ContentPages SET Title=@title, Slug=@slug, PageType=@type, Summary=@summary, Content=@content, ContentFormat=@format, PageStatus=@status, PublishedAtUtc=@publishedAt, UpdatedByUserId=@userId, UpdatedAtUtc=SYSUTCDATETIME() OUTPUT inserted.* WHERE ContentPageId=@id;`);
  await insertRevision(id, { ...next, status: next.status, publishedAtUtc: publishedAt }, userId, 'Updated');
  return pageRow(result.recordset[0]);
}

export async function listAdminSeo(query) {
  const pool = await getPool();
  const { limit, offset } = pagination(query);
  const request = pool.request().input('limit', sql.Int, limit).input('offset', sql.Int, offset);
  if (query.search) request.input('search', sql.NVarChar(220), `%${query.search}%`);
  const result = await request.query(`
    SELECT *, COUNT(1) OVER() AS TotalRows FROM dbo.SeoMetadata
    ${query.search ? 'WHERE MetaTitle LIKE @search OR Path LIKE @search OR MetaDescription LIKE @search' : ''}
    ORDER BY UpdatedAtUtc DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
  `);
  return { rows: result.recordset.map(({ TotalRows, ...row }) => seoRow(row)), total: Number(result.recordset[0]?.TotalRows || 0) };
}

export const getAdminSeo = (id) => getById('SeoMetadata', 'SeoMetadataId', id, seoRow);

export async function createSeo(input, userId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.UniqueIdentifier, randomUUID()).input('entityType', sql.VarChar(40), input.entityType).input('entityId', sql.UniqueIdentifier, input.entityId ?? null)
    .input('path', sql.NVarChar(500), input.path ?? null).input('metaTitle', sql.NVarChar(70), input.metaTitle).input('metaDescription', sql.NVarChar(170), input.metaDescription)
    .input('canonicalUrl', sql.NVarChar(1000), input.canonicalUrl ?? null).input('robots', sql.VarChar(80), input.robotsDirective ?? null)
    .input('ogTitle', sql.NVarChar(100), input.ogTitle ?? null).input('ogDescription', sql.NVarChar(220), input.ogDescription ?? null).input('ogImageUrl', sql.NVarChar(1000), input.ogImageUrl ?? null)
    .input('userId', sql.UniqueIdentifier, userId ?? null)
    .query(`INSERT INTO dbo.SeoMetadata (SeoMetadataId, EntityType, EntityId, Path, MetaTitle, MetaDescription, CanonicalUrl, RobotsDirective, OgTitle, OgDescription, OgImageUrl, CreatedByUserId, UpdatedByUserId)
      OUTPUT inserted.* VALUES (@id, @entityType, @entityId, @path, @metaTitle, @metaDescription, @canonicalUrl, @robots, @ogTitle, @ogDescription, @ogImageUrl, @userId, @userId);`);
  return seoRow(result.recordset[0]);
}

export async function updateSeo(id, input, userId) {
  const current = await getAdminSeo(id);
  if (!current) return null;
  const next = { ...current, ...input };
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.UniqueIdentifier, id).input('entityType', sql.VarChar(40), next.entityType).input('entityId', sql.UniqueIdentifier, next.entityId ?? null)
    .input('path', sql.NVarChar(500), next.path ?? null).input('metaTitle', sql.NVarChar(70), next.metaTitle).input('metaDescription', sql.NVarChar(170), next.metaDescription)
    .input('canonicalUrl', sql.NVarChar(1000), next.canonicalUrl ?? null).input('robots', sql.VarChar(80), next.robotsDirective ?? null)
    .input('ogTitle', sql.NVarChar(100), next.ogTitle ?? null).input('ogDescription', sql.NVarChar(220), next.ogDescription ?? null).input('ogImageUrl', sql.NVarChar(1000), next.ogImageUrl ?? null)
    .input('userId', sql.UniqueIdentifier, userId ?? null)
    .query(`UPDATE dbo.SeoMetadata SET EntityType=@entityType, EntityId=@entityId, Path=@path, MetaTitle=@metaTitle, MetaDescription=@metaDescription, CanonicalUrl=@canonicalUrl, RobotsDirective=@robots, OgTitle=@ogTitle, OgDescription=@ogDescription, OgImageUrl=@ogImageUrl, UpdatedByUserId=@userId, UpdatedAtUtc=SYSUTCDATETIME() OUTPUT inserted.* WHERE SeoMetadataId=@id;`);
  return seoRow(result.recordset[0]);
}

export async function deleteSeo(id) {
  const pool = await getPool();
  const result = await pool.request().input('id', sql.UniqueIdentifier, id).query('DELETE FROM dbo.SeoMetadata WHERE SeoMetadataId = @id;');
  return result.rowsAffected[0] > 0;
}

export async function listAdminFeatured(query) {
  const pool = await getPool();
  const { limit, offset } = pagination(query);
  const request = pool.request().input('limit', sql.Int, limit).input('offset', sql.Int, offset);
  const where = ['1 = 1'];
  if (query.search) { request.input('search', sql.NVarChar(220), `%${query.search}%`); where.push('(p.ProductName LIKE @search OR fp.SectionKey LIKE @search)'); }
  if (query.status) { request.input('status', sql.VarChar(30), query.status); where.push('fp.FeaturedStatus = @status'); }
  const result = await request.query(`
    SELECT fp.*, p.ProductName, p.Slug, p.ShortDescription, c.CategoryName,
           MIN(v.SellingPrice) AS SellingPrice, MAX(v.CompareAtPrice) AS CompareAtPrice, MAX(i.ImageUrl) AS ImageUrl,
           COUNT(1) OVER() AS TotalRows
    FROM dbo.FeaturedProducts fp
    INNER JOIN dbo.Products p ON p.ProductId = fp.ProductId
    INNER JOIN dbo.Categories c ON c.CategoryId = p.CategoryId
    LEFT JOIN dbo.ProductVariants v ON v.ProductId = p.ProductId AND v.IsActive = 1
    LEFT JOIN dbo.ProductImages i ON i.ProductId = p.ProductId AND i.IsPrimary = 1
    WHERE ${where.join(' AND ')}
    GROUP BY fp.FeaturedProductId, fp.ProductId, fp.SectionKey, fp.DisplayOrder, fp.FeaturedStatus, fp.StartAtUtc, fp.EndAtUtc, fp.CreatedByUserId, fp.UpdatedByUserId, fp.CreatedAtUtc, fp.UpdatedAtUtc, p.ProductName, p.Slug, p.ShortDescription, c.CategoryName
    ORDER BY fp.SectionKey, fp.DisplayOrder OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
  `);
  return { rows: result.recordset.map(({ TotalRows, ...row }) => featuredRow(row)), total: Number(result.recordset[0]?.TotalRows || 0) };
}

export async function createFeatured(input, userId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.UniqueIdentifier, randomUUID()).input('productId', sql.UniqueIdentifier, input.productId).input('sectionKey', sql.NVarChar(80), input.sectionKey)
    .input('displayOrder', sql.Int, input.displayOrder).input('status', sql.VarChar(30), input.status).input('startAt', sql.DateTime2, input.startAtUtc ?? null).input('endAt', sql.DateTime2, input.endAtUtc ?? null)
    .input('userId', sql.UniqueIdentifier, userId ?? null)
    .query(`INSERT INTO dbo.FeaturedProducts (FeaturedProductId, ProductId, SectionKey, DisplayOrder, FeaturedStatus, StartAtUtc, EndAtUtc, CreatedByUserId, UpdatedByUserId)
      OUTPUT inserted.* VALUES (@id, @productId, @sectionKey, @displayOrder, @status, @startAt, @endAt, @userId, @userId);`);
  return result.recordset[0];
}

export async function updateFeatured(id, input, userId) {
  const pool = await getPool();
  const current = await getById('FeaturedProducts', 'FeaturedProductId', id, (row) => ({
    productId: row.ProductId, sectionKey: row.SectionKey, displayOrder: row.DisplayOrder, status: row.FeaturedStatus, startAtUtc: row.StartAtUtc, endAtUtc: row.EndAtUtc,
  }));
  if (!current) return null;
  const next = { ...current, ...input };
  const result = await pool.request()
    .input('id', sql.UniqueIdentifier, id).input('productId', sql.UniqueIdentifier, next.productId).input('sectionKey', sql.NVarChar(80), next.sectionKey)
    .input('displayOrder', sql.Int, next.displayOrder).input('status', sql.VarChar(30), next.status).input('startAt', sql.DateTime2, next.startAtUtc ?? null).input('endAt', sql.DateTime2, next.endAtUtc ?? null)
    .input('userId', sql.UniqueIdentifier, userId ?? null)
    .query(`UPDATE dbo.FeaturedProducts SET ProductId=@productId, SectionKey=@sectionKey, DisplayOrder=@displayOrder, FeaturedStatus=@status, StartAtUtc=@startAt, EndAtUtc=@endAt, UpdatedByUserId=@userId, UpdatedAtUtc=SYSUTCDATETIME() OUTPUT inserted.* WHERE FeaturedProductId=@id;`);
  return result.recordset[0];
}

export async function archiveFeatured(id) {
  return deleteOrArchive('FeaturedProducts', 'FeaturedProductId', 'FeaturedStatus', id);
}

export async function reorder(table, idColumn, items) {
  const pool = await getPool();
  const tx = new sql.Transaction(pool);
  await tx.begin();
  try {
    for (const item of items) {
      await new sql.Request(tx).input('id', sql.UniqueIdentifier, item.id).input('displayOrder', sql.Int, item.displayOrder)
        .query(`UPDATE dbo.${table} SET DisplayOrder = @displayOrder, UpdatedAtUtc = SYSUTCDATETIME() WHERE ${idColumn} = @id;`);
    }
    await tx.commit();
  } catch (error) {
    await tx.rollback();
    throw error;
  }
}

export async function listSitemapEntries() {
  const pool = await getPool();
  const [pages, products, categories] = await Promise.all([
    pool.request().query(`
      SELECT Slug, UpdatedAtUtc FROM dbo.ContentPages
      WHERE PageStatus = 'PUBLISHED' AND (PublishedAtUtc IS NULL OR PublishedAtUtc <= SYSUTCDATETIME());
    `),
    pool.request().query(`
      SELECT Slug, UpdatedAtUtc FROM dbo.Products
      WHERE ProductStatus = N'Active';
    `),
    pool.request().query(`
      SELECT Slug, UpdatedAtUtc FROM dbo.Categories
      WHERE IsActive = 1;
    `),
  ]);
  return {
    pages: pages.recordset,
    products: products.recordset,
    categories: categories.recordset,
  };
}
