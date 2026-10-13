import { AppError } from '../../common/errors/AppError.js';
import * as service from './content.service.js';
import {
  bannerPatchSchema,
  bannerSchema,
  featuredPatchSchema,
  featuredSchema,
  idSchema,
  pagePatchSchema,
  pageSchema,
  paginationSchema,
  promotionPatchSchema,
  promotionSchema,
  reorderSchema,
  seoPatchSchema,
  seoQuerySchema,
  seoSchema,
  slugParamSchema,
} from './content.validation.js';

function parse(schema, value, code = 'INVALID_CONTENT_INPUT') {
  const result = schema.safeParse(value);
  if (!result.success) throw new AppError(400, code, 'Content request is invalid.', result.error.flatten());
  return result.data;
}

const userId = (req) => req.user?.id ?? null;

export async function publicHome(req, res) {
  res.json({ data: await service.home() });
}

export async function publicBanners(req, res) {
  res.json({ data: { banners: await service.banners() } });
}

export async function publicPromotions(req, res) {
  res.json({ data: { promotions: await service.promotions() } });
}

export async function publicFeatured(req, res) {
  res.json({ data: { featuredProducts: await service.featuredProducts(req.query.sectionKey) } });
}

export async function publicPage(req, res) {
  const params = parse(slugParamSchema, req.params);
  res.json({ data: { page: await service.publicPage(params.slug) } });
}

export async function publicSeo(req, res) {
  res.json({ data: { seo: await service.seo(parse(seoQuerySchema, req.query)) } });
}

export async function sitemap(req, res) {
  res.type('application/xml').send(await service.sitemap());
}

export async function robots(req, res) {
  res.type('text/plain').send(service.robots());
}

export async function adminBanners(req, res) {
  res.json({ data: { banners: await service.listBanners(parse(paginationSchema, req.query)) } });
}

export async function adminBanner(req, res) {
  res.json({ data: { banner: await service.getBanner(parse(idSchema, req.params).id) } });
}

export async function createBanner(req, res) {
  res.status(201).json({ data: { banner: await service.createBanner(parse(bannerSchema, req.body), userId(req)) } });
}

export async function updateBanner(req, res) {
  res.json({ data: { banner: await service.updateBanner(parse(idSchema, req.params).id, parse(bannerPatchSchema, req.body), userId(req)) } });
}

export async function deleteBanner(req, res) {
  await service.archiveBanner(parse(idSchema, req.params).id);
  res.status(204).send();
}

export async function reorderBanners(req, res) {
  await service.reorderBanners(parse(reorderSchema, req.body).items);
  res.status(204).send();
}

export async function adminPromotions(req, res) {
  res.json({ data: { promotions: await service.listPromotions(parse(paginationSchema, req.query)) } });
}

export async function adminPromotion(req, res) {
  res.json({ data: { promotion: await service.getPromotion(parse(idSchema, req.params).id) } });
}

export async function createPromotion(req, res) {
  res.status(201).json({ data: { promotion: await service.createPromotion(parse(promotionSchema, req.body), userId(req)) } });
}

export async function updatePromotion(req, res) {
  res.json({ data: { promotion: await service.updatePromotion(parse(idSchema, req.params).id, parse(promotionPatchSchema, req.body), userId(req)) } });
}

export async function deletePromotion(req, res) {
  await service.archivePromotion(parse(idSchema, req.params).id);
  res.status(204).send();
}

export async function reorderPromotions(req, res) {
  await service.reorderPromotions(parse(reorderSchema, req.body).items);
  res.status(204).send();
}

export async function adminPages(req, res) {
  res.json({ data: { pages: await service.listPages(parse(paginationSchema, req.query)) } });
}

export async function adminPage(req, res) {
  res.json({ data: { page: await service.getPage(parse(idSchema, req.params).id) } });
}

export async function createPage(req, res) {
  res.status(201).json({ data: { page: await service.createPage(parse(pageSchema, req.body), userId(req)) } });
}

export async function updatePage(req, res) {
  res.json({ data: { page: await service.updatePage(parse(idSchema, req.params).id, parse(pagePatchSchema, req.body), userId(req)) } });
}

export async function publishPage(req, res) {
  res.json({ data: { page: await service.publishPage(parse(idSchema, req.params).id, userId(req)) } });
}

export async function archivePage(req, res) {
  res.json({ data: { page: await service.archivePage(parse(idSchema, req.params).id, userId(req)) } });
}

export async function pageRevisions(req, res) {
  res.json({ data: { revisions: await service.revisions(parse(idSchema, req.params).id) } });
}

export async function adminSeo(req, res) {
  res.json({ data: { seo: await service.listSeo(parse(paginationSchema, req.query)) } });
}

export async function adminSeoDetail(req, res) {
  res.json({ data: { seo: await service.getSeo(parse(idSchema, req.params).id) } });
}

export async function createSeo(req, res) {
  res.status(201).json({ data: { seo: await service.createSeo(parse(seoSchema, req.body), userId(req)) } });
}

export async function updateSeo(req, res) {
  res.json({ data: { seo: await service.updateSeo(parse(idSchema, req.params).id, parse(seoPatchSchema, req.body), userId(req)) } });
}

export async function deleteSeo(req, res) {
  await service.deleteSeo(parse(idSchema, req.params).id);
  res.status(204).send();
}

export async function adminFeatured(req, res) {
  res.json({ data: { featuredProducts: await service.listFeatured(parse(paginationSchema, req.query)) } });
}

export async function createFeatured(req, res) {
  res.status(201).json({ data: { featuredProduct: await service.createFeatured(parse(featuredSchema, req.body), userId(req)) } });
}

export async function updateFeatured(req, res) {
  res.json({ data: { featuredProduct: await service.updateFeatured(parse(idSchema, req.params).id, parse(featuredPatchSchema, req.body), userId(req)) } });
}

export async function deleteFeatured(req, res) {
  await service.archiveFeatured(parse(idSchema, req.params).id);
  res.status(204).send();
}

export async function reorderFeatured(req, res) {
  await service.reorderFeatured(parse(reorderSchema, req.body).items);
  res.status(204).send();
}
