# Candle Commerce Phase 0 Report

## Source Files Reviewed

- Available: pasted project prompt and previously pasted MSSQL baseline schema.
- Missing from workspace: `001_candle_ecommerce_schema.sql`, `Candle_Ecommerce_SRS.docx`, and `Candle_Ecommerce_SDD.docx`.
- Current repo inspected: React/Vite frontend, Express backend, MSSQL connection setup, schema-driven admin resources, storefront fallback data, and health endpoints.

Because the SRS and SDD documents are not present in `D:\candle-ecommerce`, this report uses the pasted prompt and schema as the source of truth for now. Add the three project files to the repo before final acceptance work.

## Database Compatibility Report

The pasted schema supports the core MVP domains:

- Identity: `Users`, `Roles`, `UserRoles`, token tables, user addresses.
- Catalog: `Categories`, `Brands`, `Fragrances`, `Products`, `ProductVariants`, images, specifications, tags.
- Inventory: `Inventory`, `InventoryMovements`, `InventoryReservations`.
- Commerce: `Carts`, `CartItems`, `CheckoutSessions`, `Orders`, `OrderItems`, order addresses and status history.
- Payments: `Payments`, `PaymentAttempts`, webhook events, refunds.
- Shipping: methods, zones, rates, shipments, tracking events.
- Promotions: coupons, coupon usages, product discounts.
- Customer content/support: reviews, review images, notifications, contact messages, support tickets.
- Store operations: settings, banners, pages, audit logs.

Current local DB status:

- The API can connect to SQL Server when `/api/v1/health/ready` returns `200`.
- If startup prints `Database schema missing tables`, the connection works but the baseline schema has not been run in the configured database.
- The pasted error `Invalid object name 'dbo.Categories'` means the database is connected, but required tables are missing.

Recommended immediate action:

1. Create or select the `CandleEcommerce` database in SSMS.
2. Run the full baseline SQL script in that database.
3. Restart the backend and confirm startup prints `Database schema ready.`

## Implementation Plan

### Phase 1: Foundation

- Keep React, Vite, Tailwind, TanStack Query, React Router, Node, Express, and MSSQL.
- Maintain `/api/v1` base path.
- Finalize environment configuration for SQL auth and Windows integrated auth.
- Keep startup DB status checks and concise terminal logs.
- Add auth module with bcrypt password hashing, session strategy, role middleware, and validation.
- Add database transaction helper for checkout and inventory workflows.

### Phase 2: Catalog

- Replace fallback storefront data with real SQL-backed product/category responses after schema is installed.
- Implement `/api/v1/products` and `/api/v1/categories` as public canonical endpoints.
- Support search, filtering, sorting, pagination, variants, images, inventory availability, fragrance data, and product detail.
- Add admin product/category/fragrance/image/specification CRUD with validation and audit logging.

### Phase 3: Cart and Checkout

- Implement cart creation for logged-in users and supported guest sessions.
- Add cart item add/update/remove APIs with quantity validation.
- Implement backend quote calculation for subtotal, coupon, shipping, tax, and grand total.
- Implement checkout order creation with idempotency key and SQL transaction.
- Reserve inventory atomically and roll back complete checkout if any item fails.

### Phase 4: Payments and Orders

- Add payment provider abstraction without hardcoding a provider.
- Store payment attempts and webhook events.
- Require verified webhook confirmation before marking orders paid.
- Add customer order history/detail APIs and admin order operations.
- Implement status transition validation.

### Phase 5: Administration

- Build protected admin routes and UI layout.
- Add metrics from real SQL data only.
- Complete inventory adjustment, promotions, content, reports, customer management, and audit views.

### Phase 6: Hardening

- Add unit, integration, concurrency, and Playwright tests.
- Add OpenAPI documentation.
- Add security checks, accessibility review, deployment notes, backup/restore instructions, and audit coverage review.

## Unresolved Business Decisions

- Payment provider and webhook signing method.
- Tax rules and tax-inclusive or tax-exclusive pricing.
- Shipping carrier/rate policy and free shipping thresholds.
- Guest checkout policy and guest cart retention.
- Coupon stacking and product eligibility rules.
- Cancellation, return, and refund approval policy.
- Image storage provider and upload limits.
- Email provider for verification, password reset, order emails, and support replies.
- Admin role matrix beyond `ADMIN`, `SUPPORT`, and `CUSTOMER`.

## Current Gaps Before MVP Acceptance

- SRS and SDD files are missing from the repo.
- Baseline SQL file is not committed under `database/migrations`.
- Auth, cart, checkout, payments, and full admin workflows are not complete.
- Public storefront currently has fallback data for local development when schema tables are missing.
- Automated tests and OpenAPI docs still need to be added.
