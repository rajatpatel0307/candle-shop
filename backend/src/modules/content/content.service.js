import { AppError } from '../../common/errors/AppError.js';
import { clearContentCache, getCached, setCached } from './content.cache.js';
import { sanitizeContent } from './content.sanitize.js';
import * as repo from './content.repository.js';

function paged(result, query) {
  return { items: result.rows, pagination: { page: query.page, limit: query.limit, total: result.total } };
}

function ensureFound(item, code, message) {
  if (!item) throw new AppError(404, code, message);
  return item;
}

function cleanPage(input) {
  if (!input.content) return input;
  return { ...input, content: sanitizeContent(input.content) };
}

export async function home() {
  const cached = getCached('content:home');
  if (cached) return cached;
  const [banners, promotions, featuredProducts] = await Promise.all([
    repo.listPublicBanners(),
    repo.listPublicPromotions(),
    repo.listPublicFeatured(),
  ]);
  return setCached('content:home', { banners, promotions, featuredProducts });
}

export async function banners() {
  return repo.listPublicBanners();
}

export async function promotions() {
  return repo.listPublicPromotions();
}

export async function featuredProducts(sectionKey) {
  return repo.listPublicFeatured(sectionKey);
}

export async function publicPage(slug) {
  return ensureFound(await repo.getPublicPage(slug), 'CONTENT_PAGE_NOT_FOUND', 'Content page was not found.');
}

export async function seo(query) {
  const metadata = await repo.resolveSeo(query);
  if (metadata) return metadata;
  const label = query.path ? query.path.replace(/^\/+/, '').replace(/[-/]+/g, ' ') || 'Home' : 'Candle Studio';
  return {
    metaTitle: `${label.charAt(0).toUpperCase()}${label.slice(1)} | Candle Studio`.slice(0, 70),
    metaDescription: 'Shop scented candles, curated gifts, and home fragrance essentials from Candle Studio.',
    canonicalUrl: query.path || '/',
    robotsDirective: 'index,follow',
  };
}

export async function listBanners(query) {
  return paged(await repo.listAdminBanners(query), query);
}

export async function getBanner(id) {
  return ensureFound(await repo.getAdminBanner(id), 'BANNER_NOT_FOUND', 'Banner was not found.');
}

export async function createBanner(input, userId) {
  const result = await repo.createBanner(input, userId);
  clearContentCache();
  return result;
}

export async function updateBanner(id, input, userId) {
  const result = ensureFound(await repo.updateBanner(id, input, userId), 'BANNER_NOT_FOUND', 'Banner was not found.');
  clearContentCache();
  return result;
}

export async function archiveBanner(id) {
  const ok = await repo.deleteOrArchive('HomepageBanners', 'HomepageBannerId', 'BannerStatus', id);
  if (!ok) throw new AppError(404, 'BANNER_NOT_FOUND', 'Banner was not found.');
  clearContentCache();
}

export async function reorderBanners(items) {
  await repo.reorder('HomepageBanners', 'HomepageBannerId', items);
  clearContentCache();
}

export async function listPromotions(query) {
  return paged(await repo.listAdminPromotions(query), query);
}

export async function getPromotion(id) {
  return ensureFound(await repo.getAdminPromotion(id), 'PROMOTION_NOT_FOUND', 'Promotion was not found.');
}

export async function createPromotion(input, userId) {
  const result = await repo.createPromotion(input, userId);
  clearContentCache();
  return result;
}

export async function updatePromotion(id, input, userId) {
  const result = ensureFound(await repo.updatePromotion(id, input, userId), 'PROMOTION_NOT_FOUND', 'Promotion was not found.');
  clearContentCache();
  return result;
}

export async function archivePromotion(id) {
  const ok = await repo.deleteOrArchive('PromotionalSections', 'PromotionalSectionId', 'SectionStatus', id);
  if (!ok) throw new AppError(404, 'PROMOTION_NOT_FOUND', 'Promotion was not found.');
  clearContentCache();
}

export async function reorderPromotions(items) {
  await repo.reorder('PromotionalSections', 'PromotionalSectionId', items);
  clearContentCache();
}

export async function listPages(query) {
  return paged(await repo.listAdminPages(query), query);
}

export async function getPage(id) {
  return ensureFound(await repo.getAdminPage(id), 'CONTENT_PAGE_NOT_FOUND', 'Content page was not found.');
}

export async function createPage(input, userId) {
  const result = await repo.createPage(cleanPage(input), userId);
  clearContentCache();
  return result;
}

export async function updatePage(id, input, userId) {
  const result = ensureFound(await repo.updatePage(id, cleanPage(input), userId), 'CONTENT_PAGE_NOT_FOUND', 'Content page was not found.');
  clearContentCache();
  return result;
}

export async function publishPage(id, userId) {
  return updatePage(id, { status: 'PUBLISHED', publishedAtUtc: new Date() }, userId);
}

export async function archivePage(id, userId) {
  return updatePage(id, { status: 'ARCHIVED' }, userId);
}

export async function revisions(id) {
  await getPage(id);
  return repo.listRevisions(id);
}

export async function listSeo(query) {
  return paged(await repo.listAdminSeo(query), query);
}

export async function getSeo(id) {
  return ensureFound(await repo.getAdminSeo(id), 'SEO_METADATA_NOT_FOUND', 'SEO metadata was not found.');
}

export async function createSeo(input, userId) {
  const result = await repo.createSeo(input, userId);
  clearContentCache();
  return result;
}

export async function updateSeo(id, input, userId) {
  const result = ensureFound(await repo.updateSeo(id, input, userId), 'SEO_METADATA_NOT_FOUND', 'SEO metadata was not found.');
  clearContentCache();
  return result;
}

export async function deleteSeo(id) {
  const ok = await repo.deleteSeo(id);
  if (!ok) throw new AppError(404, 'SEO_METADATA_NOT_FOUND', 'SEO metadata was not found.');
  clearContentCache();
}

export async function listFeatured(query) {
  return paged(await repo.listAdminFeatured(query), query);
}

export async function createFeatured(input, userId) {
  const result = await repo.createFeatured(input, userId);
  clearContentCache();
  return result;
}

export async function updateFeatured(id, input, userId) {
  const result = ensureFound(await repo.updateFeatured(id, input, userId), 'FEATURED_PRODUCT_NOT_FOUND', 'Featured product was not found.');
  clearContentCache();
  return result;
}

export async function archiveFeatured(id) {
  const ok = await repo.archiveFeatured(id);
  if (!ok) throw new AppError(404, 'FEATURED_PRODUCT_NOT_FOUND', 'Featured product was not found.');
  clearContentCache();
}

export async function reorderFeatured(items) {
  await repo.reorder('FeaturedProducts', 'FeaturedProductId', items);
  clearContentCache();
}

function publicOrigin() {
  return (process.env.PUBLIC_SITE_ORIGIN || process.env.FRONTEND_ORIGIN || 'https://example.com').replace(/\/$/, '');
}

function xmlEscape(value) {
  return String(value).replace(/[<>&'"]/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[char]));
}

export async function sitemap() {
  const origin = publicOrigin();
  const entries = await repo.listSitemapEntries();
  const urls = [
    { loc: `${origin}/`, lastmod: new Date().toISOString() },
    ...entries.pages.map((page) => ({ loc: `${origin}/${page.Slug}`, lastmod: page.UpdatedAtUtc })),
    ...entries.products.map((product) => ({ loc: `${origin}/products/${product.Slug}`, lastmod: product.UpdatedAtUtc })),
    ...entries.categories.map((category) => ({ loc: `${origin}/shop?category=${encodeURIComponent(category.Slug)}`, lastmod: category.UpdatedAtUtc })),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${xmlEscape(url.loc)}</loc><lastmod>${new Date(url.lastmod || Date.now()).toISOString()}</lastmod></url>`).join('\n')}\n</urlset>`;
}

export function robots() {
  return `User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${publicOrigin()}/api/v1/content/sitemap.xml\n`;
}
