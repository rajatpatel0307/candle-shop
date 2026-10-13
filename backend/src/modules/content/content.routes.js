import { Router } from 'express';
import { asyncHandler } from '../../common/middleware/asyncHandler.js';
import { authenticate } from '../auth/auth.middleware.js';
import { requireContentAdmin } from './content.policy.js';
import * as controller from './content.controller.js';

export const publicContentRoutes = Router();
publicContentRoutes.get('/home', asyncHandler(controller.publicHome));
publicContentRoutes.get('/banners', asyncHandler(controller.publicBanners));
publicContentRoutes.get('/promotions', asyncHandler(controller.publicPromotions));
publicContentRoutes.get('/featured-products', asyncHandler(controller.publicFeatured));
publicContentRoutes.get('/pages/:slug', asyncHandler(controller.publicPage));
publicContentRoutes.get('/seo', asyncHandler(controller.publicSeo));
publicContentRoutes.get('/sitemap.xml', asyncHandler(controller.sitemap));
publicContentRoutes.get('/robots.txt', asyncHandler(controller.robots));

export const adminContentRoutes = Router();
adminContentRoutes.use(authenticate, requireContentAdmin);

adminContentRoutes.get('/banners', asyncHandler(controller.adminBanners));
adminContentRoutes.post('/banners', asyncHandler(controller.createBanner));
adminContentRoutes.patch('/banners/reorder', asyncHandler(controller.reorderBanners));
adminContentRoutes.get('/banners/:id', asyncHandler(controller.adminBanner));
adminContentRoutes.patch('/banners/:id', asyncHandler(controller.updateBanner));
adminContentRoutes.delete('/banners/:id', asyncHandler(controller.deleteBanner));

adminContentRoutes.get('/promotions', asyncHandler(controller.adminPromotions));
adminContentRoutes.post('/promotions', asyncHandler(controller.createPromotion));
adminContentRoutes.patch('/promotions/reorder', asyncHandler(controller.reorderPromotions));
adminContentRoutes.get('/promotions/:id', asyncHandler(controller.adminPromotion));
adminContentRoutes.patch('/promotions/:id', asyncHandler(controller.updatePromotion));
adminContentRoutes.delete('/promotions/:id', asyncHandler(controller.deletePromotion));

adminContentRoutes.get('/pages', asyncHandler(controller.adminPages));
adminContentRoutes.post('/pages', asyncHandler(controller.createPage));
adminContentRoutes.get('/pages/:id/revisions', asyncHandler(controller.pageRevisions));
adminContentRoutes.get('/pages/:id', asyncHandler(controller.adminPage));
adminContentRoutes.patch('/pages/:id', asyncHandler(controller.updatePage));
adminContentRoutes.patch('/pages/:id/publish', asyncHandler(controller.publishPage));
adminContentRoutes.patch('/pages/:id/archive', asyncHandler(controller.archivePage));

adminContentRoutes.get('/seo', asyncHandler(controller.adminSeo));
adminContentRoutes.post('/seo', asyncHandler(controller.createSeo));
adminContentRoutes.get('/seo/:id', asyncHandler(controller.adminSeoDetail));
adminContentRoutes.patch('/seo/:id', asyncHandler(controller.updateSeo));
adminContentRoutes.delete('/seo/:id', asyncHandler(controller.deleteSeo));

adminContentRoutes.get('/featured-products', asyncHandler(controller.adminFeatured));
adminContentRoutes.post('/featured-products', asyncHandler(controller.createFeatured));
adminContentRoutes.patch('/featured-products/reorder', asyncHandler(controller.reorderFeatured));
adminContentRoutes.patch('/featured-products/:id', asyncHandler(controller.updateFeatured));
adminContentRoutes.delete('/featured-products/:id', asyncHandler(controller.deleteFeatured));

export default publicContentRoutes;
