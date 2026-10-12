# Module 2: Product Catalogue Phase 1 Analysis

## Scope

This phase inspects the existing project and defines the catalogue architecture before implementing database, API, or UI changes.

## Existing Project Architecture

### Backend

- Runtime: Node.js, Express, ES modules.
- API base path: `/api/v1`.
- Database: MSSQL via shared `getPool()` in `backend/src/config/database.js`.
- Shared middleware already present:
  - `asyncHandler`
  - `errorHandler`
  - `rateLimiter`
  - `notFound`
  - `authenticate` and `authorizeRoles` from Module 1.
- Current mounted routes:
  - `/api/v1/health`
  - `/api/v1/auth`
  - `/api/v1/store`
  - `/api/v1/admin`
- Current catalogue-related implementation:
  - `backend/src/modules/storefront/storefront.repository.js`
  - `backend/src/modules/storefront/storefront.routes.js`
  - Generic schema-driven admin CRUD in `backend/src/modules/admin`.
- Empty or placeholder feature folders already exist for `products`, `categories`, `fragrances`, `inventory`, `reviews`, `wishlists`, etc.

### Frontend

- Runtime: React, Vite, JavaScript.
- Styling: Tailwind CSS.
- Data: Axios API client and TanStack Query.
- Auth state: Redux Toolkit from Module 1.
- Current catalogue UI lives mostly inside `frontend/src/App.jsx`.
- Existing public routes:
  - `/`
  - `/shop`
  - `/products/:slug`
  - `/categories`
- Current product/category views are functional but monolithic and should be moved into feature folders during implementation.

## Existing Schema Compatibility

The pasted baseline SQL already contains catalogue tables. The Module 2 prompt suggests new generic table shapes, but the existing schema must remain the source of truth.

### Existing Compatible Tables

- `dbo.Categories`
  - Primary key: `CategoryId INT`
  - Parent key: `ParentCategoryId INT`
  - Public fields: `CategoryName`, `Slug`, `Description`, `ImageUrl`, `DisplayOrder`, `IsActive`

- `dbo.Brands`
  - Primary key: `BrandId INT`
  - Public fields: `BrandName`, `Slug`, `Description`, `LogoUrl`, `IsActive`

- `dbo.Fragrances`
  - Primary key: `FragranceId INT`
  - Public fields: `FragranceName`, `Slug`, `Description`, `ScentFamily`, `IsActive`

- `dbo.Products`
  - Primary key: `ProductId UNIQUEIDENTIFIER`
  - Foreign keys: `CategoryId`, `BrandId`
  - Public fields: `ProductName`, `Slug`, `ShortDescription`, `Description`, `ProductType`, `ProductStatus`, `IsFeatured`
  - Publication rule: public products require `ProductStatus = 'Active'`

- `dbo.ProductVariants`
  - Primary key: `ProductVariantId UNIQUEIDENTIFIER`
  - Foreign keys: `ProductId`, `FragranceId`
  - Includes SKU, size, material, burn time, cost price, selling price, compare-at price, weight, active flag.
  - Important rule: public APIs must not expose `CostPrice`.

- `dbo.ProductImages`
  - Primary key: `ProductImageId BIGINT`
  - Supports product and optional variant images, alt text, display order, primary image.

- `dbo.ProductSpecifications`
  - Primary key: `ProductSpecificationId BIGINT`
  - Flexible display specifications.

- `dbo.Inventory`
  - Primary key: `ProductVariantId`
  - Includes `OnHandQuantity`, `ReservedQuantity`, computed `AvailableQuantity`.

- `dbo.ProductReviews`
  - Can support published reviews on product detail pages.

## Schema Differences From Module 2 Prompt

The Module 2 prompt suggests creating new tables with columns such as `Id`, `Name`, `PublicationStatus`, `FragranceFamily`, `TopNotes`, and `WebsiteUrl`.

The current baseline already has equivalent or partial equivalents:

- `Categories.Id` should map to existing `CategoryId`.
- `Categories.Name` should map to `CategoryName`.
- `Brands.Id` should map to `BrandId`.
- `Brands.Name` should map to `BrandName`.
- `Fragrances.Id` should map to `FragranceId`.
- `Fragrances.Name` should map to `FragranceName`.
- `FragranceFamily` should map to existing `ScentFamily`.
- `Products.PublicationStatus` should map to existing `ProductStatus`.
- Variant-level price already exists in `ProductVariants.SellingPrice`; do not duplicate price in `Products`.
- Inventory already exists in `Inventory`; do not duplicate stock on products or variants.

Potential future migrations, only if SRS/SDD requires them:

- Add `Brands.WebsiteUrl`.
- Add fragrance note fields such as `TopNotes`, `MiddleNotes`, `BaseNotes`.
- Add product fields such as `WaxType`, `WickType`, `CountryOfOrigin` if they must be filterable.
- Add variant fields such as `ContainerType`, `ContainerColor`, `WickCount`, `IsDefault` if required.

These should be explicit migrations, not replacement tables.

## Proposed Backend Catalogue Architecture

Create dedicated modules:

- `backend/src/modules/products`
- `backend/src/modules/categories`
- `backend/src/modules/brands`
- `backend/src/modules/fragrances`

Each module should use:

- `*.routes.js`
- `*.controller.js`
- `*.service.js`
- `*.repository.js`
- `*.validation.js`
- `index.js`

### Public Endpoints

Use `/api/v1` consistently:

- `GET /api/v1/products`
- `GET /api/v1/products/featured`
- `GET /api/v1/products/:slug`
- `GET /api/v1/categories`
- `GET /api/v1/categories/:slug`
- `GET /api/v1/categories/:slug/products`
- `GET /api/v1/brands`
- `GET /api/v1/brands/:slug`
- `GET /api/v1/brands/:slug/products`
- `GET /api/v1/fragrances`
- `GET /api/v1/fragrances/:slug`
- `GET /api/v1/fragrances/:slug/products`

### Admin Endpoints

Protect all mutations with `authenticate` and `authorizeRoles('ADMIN')`:

- `POST /api/v1/products`
- `PUT /api/v1/products/:id`
- `PATCH /api/v1/products/:id/status`
- `POST /api/v1/products/:id/publish`
- `POST /api/v1/products/:id/archive`
- `POST /api/v1/products/:id/images`
- `DELETE /api/v1/products/:id/images/:imageId`
- `POST /api/v1/products/:id/variants`
- `PUT /api/v1/products/:id/variants/:variantId`
- `PATCH /api/v1/products/:id/variants/:variantId/status`
- Category, brand, and fragrance create/update/status/delete endpoints.

## Product Listing Query Rules

The product listing repository should:

- Use parameterized SQL only.
- Allowlist sort fields.
- Cap `limit`, default page to 1.
- Filter public products by:
  - `p.ProductStatus = N'Active'`
  - active category
  - at least one active variant where needed
- Support filters:
  - search
  - category slug
  - brand slug
  - fragrance slug
  - scent family
  - min/max price using variant selling price
  - min/max size using variant size value
  - availability via inventory available quantity
  - featured flag
- Return total count without row multiplication from joins.
- Return one listing row per product with primary image and min selling price.

## Proposed Frontend Catalogue Architecture

Move catalogue UI out of `App.jsx` into:

- `frontend/src/features/catalog`
- `frontend/src/features/categories`
- `frontend/src/features/brands`
- `frontend/src/features/fragrances`

The existing `Shell`, `ProductCard`, listing, detail, and categories logic can be refactored into reusable components.

### Public Pages

- `/shop` -> `ProductListingPage`
- `/products/:slug` -> `ProductDetailsPage`
- `/featured` -> `FeaturedProductsPage`
- `/categories` -> `CategoriesPage`
- `/brands` -> `BrandsPage`
- `/fragrances` -> `FragrancesPage`

### UI Requirements

- Filters and sorting must write to URL query parameters.
- Listing must show loading, error, empty, and retry states.
- Product detail must update price/SKU/availability when variant changes.
- Do not show fake reviews, fake ratings, fake discounts, or invented specifications.

## Reusable Existing Code

- `apiClient` and endpoint definitions.
- TanStack Query setup.
- Tailwind component classes: `btn-primary`, `btn-secondary`, `icon-btn`, `input`.
- Auth middleware and `RoleGuard`.
- Existing schema-driven admin can remain as a fallback, but dedicated catalogue admin screens should replace generic forms over time.
- Current storefront fallback data can remain only for local development when schema tables are missing.

## Entity Relationship Summary

```text
Categories 1 -> many Products
Brands 1 -> many Products
Products 1 -> many ProductVariants
Fragrances 1 -> many ProductVariants
Products 1 -> many ProductImages
ProductVariants 0/1 -> many ProductImages
Products 1 -> many ProductSpecifications
ProductVariants 1 -> 1 Inventory
Products 1 -> many ProductReviews
```

## Implementation Plan

### Phase 2: Database

- Add only safe migrations for missing fields that are genuinely required.
- Do not create duplicate catalogue tables.
- Add seed script for sample categories, brands, fragrances, products, variants, images, inventory.
- Add index recommendations for common filters after baseline schema is installed.

### Phase 3: Backend APIs

- Implement products, categories, brands, and fragrances modules.
- Add Zod validation for query params and mutation bodies.
- Add public list/detail endpoints.
- Add admin mutation endpoints with `ADMIN` authorization.
- Keep cost price and restricted fields out of public responses.
- Add tests for validation and query behavior where possible without destructive DB operations.

### Phase 4: Frontend

- Refactor current catalogue views into feature folders.
- Implement product filters, search, sort, pagination, gallery, variant selector, specifications, and entity pages.
- Preserve route compatibility for `/shop`, `/products/:slug`, `/categories`.

### Phase 5: Integration

- Wire canonical `/api/v1/products`, `/api/v1/categories`, `/api/v1/brands`, and `/api/v1/fragrances`.
- Keep `/api/v1/store` for home/content composition.
- Verify with real SQL schema after baseline script is run.

### Phase 6: Testing and Documentation

- Add API docs with examples.
- Add unit and integration tests.
- Document database setup, seed scripts, and admin workflows.

## Current Blockers

- The actual `001_candle_ecommerce_schema.sql`, SRS, and SDD files are still not present in the repo.
- Local database appears connected but may still be missing baseline tables unless the SQL script has been run.
- Cloudinary/image storage configuration is not present; image upload implementation should use metadata URLs first unless storage is configured.
