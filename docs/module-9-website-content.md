# Module 9: Website Content

## Implemented

- Additive SQL Server migration for homepage banners, promotional sections, content pages, page revisions, SEO metadata, and featured products.
- Public content API for homepage content, banners, promotions, featured products, published pages, SEO metadata, sitemap, and robots rules.
- Admin content API for banners, promotions, content pages, SEO records, and featured products.
- Server-side validation for slugs, URLs, schedules, statuses, layouts, robots directives, and SEO lengths.
- Server-side rich-content sanitization that strips scriptable tags, inline event handlers, inline styles, and `javascript:` URLs.
- Dynamic React homepage using managed banners, promotions, categories, and featured products.
- Published static content rendering for About, Terms, Privacy, and custom pages.
- Module 8 contact form remains the customer contact implementation.
- Admin CMS screens for banners, promotions, content pages, SEO records, and featured products.

## API Summary

```text
GET /api/v1/content/home
GET /api/v1/content/banners
GET /api/v1/content/promotions
GET /api/v1/content/featured-products
GET /api/v1/content/pages/:slug
GET /api/v1/content/seo
GET /api/v1/content/sitemap.xml
GET /api/v1/content/robots.txt

GET /api/v1/admin/content/banners
POST /api/v1/admin/content/banners
GET /api/v1/admin/content/banners/:id
PATCH /api/v1/admin/content/banners/:id
DELETE /api/v1/admin/content/banners/:id
PATCH /api/v1/admin/content/banners/reorder

GET /api/v1/admin/content/promotions
POST /api/v1/admin/content/promotions
GET /api/v1/admin/content/promotions/:id
PATCH /api/v1/admin/content/promotions/:id
DELETE /api/v1/admin/content/promotions/:id
PATCH /api/v1/admin/content/promotions/reorder

GET /api/v1/admin/content/pages
POST /api/v1/admin/content/pages
GET /api/v1/admin/content/pages/:id
PATCH /api/v1/admin/content/pages/:id
PATCH /api/v1/admin/content/pages/:id/publish
PATCH /api/v1/admin/content/pages/:id/archive
GET /api/v1/admin/content/pages/:id/revisions

GET /api/v1/admin/content/seo
POST /api/v1/admin/content/seo
GET /api/v1/admin/content/seo/:id
PATCH /api/v1/admin/content/seo/:id
DELETE /api/v1/admin/content/seo/:id

GET /api/v1/admin/content/featured-products
POST /api/v1/admin/content/featured-products
PATCH /api/v1/admin/content/featured-products/:id
DELETE /api/v1/admin/content/featured-products/:id
PATCH /api/v1/admin/content/featured-products/reorder
```

## Setup

```bash
cd backend
npm run db:migrate:website-content
npm test

cd ../frontend
npm run build
```

## Notes

- Public endpoints only return published content inside valid publication windows.
- Featured products join back to the authoritative product/catalogue tables and require active products.
- Admin delete operations archive content where publication history should be retained.
- The React/Vite app updates document metadata client-side. This improves browser metadata, but reliable social previews and search crawler metadata may require SSR, prerendering, or edge rendering in production.
- Set `PUBLIC_SITE_ORIGIN` or `FRONTEND_ORIGIN` for production sitemap URLs.
