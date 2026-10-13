# Module 7: Admin Dashboard

## Implemented

- Secured `/api/v1/admin` with authenticated ADMIN/SUPPORT access.
- Dashboard metrics APIs for summary, sales, revenue, order statuses, top products, low stock, recent orders, and recent activity.
- Reports API with CSV export and formula-injection-safe CSV escaping.
- Store settings API with ADMIN-only updates and secret-key rejection.
- Audit-log retrieval and write helper for settings changes.
- Additive migration: `database/migrations/007_admin_dashboard.sql`.
- Admin dashboard React pages under `frontend/src/admin/dashboard`.
- Admin management wrappers for products, categories, brands, fragrances, customers, coupons, shipping settings, reports, audit logs, and settings.

## API Summary

```text
GET /api/v1/admin/dashboard/summary
GET /api/v1/admin/dashboard/sales
GET /api/v1/admin/dashboard/revenue
GET /api/v1/admin/dashboard/orders
GET /api/v1/admin/dashboard/top-products
GET /api/v1/admin/dashboard/low-stock
GET /api/v1/admin/dashboard/recent-orders
GET /api/v1/admin/dashboard/recent-activity
GET /api/v1/admin/overview/products
GET /api/v1/admin/reports/:type
GET /api/v1/admin/audit-logs
GET /api/v1/admin/audit-logs/:id
GET /api/v1/admin/settings
PUT /api/v1/admin/settings
GET /api/v1/admin/settings/:key
PUT /api/v1/admin/settings/:key
```

Existing `/api/v1/admin/resources/:resource` remains the catalog/configuration CRUD integration layer.

## Metric Definitions

- Gross sales: sum of `Orders.GrandTotal` for `PaymentStatus = SUCCEEDED`.
- Net sales: gross sales minus processing/succeeded refund totals in the selected range.
- Successful orders: count of orders with successful payment.
- Average order value: average `GrandTotal` for successful payments.
- Top products: order items from paid, non-cancelled orders.
- Inventory metrics: authoritative `Inventory` table values only.

## Setup

```bash
cd backend
npm run db:migrate:admin-dashboard
npm test

cd ../frontend
npm run build
```

## ERD

```text
StoreSettings stores editable non-secret configuration.
AuditLogs records administrative actions.
Coupons is reused by checkout/promotion workflows.
ShippingMethods -> ShippingRates <- ShippingZones configure shipping rules.
Dashboard metrics read Orders, OrderItems, Payments, Refunds, Inventory, and AuditLogs.
```

## Notes

- Payment secrets, SMTP passwords, signing keys, and provider credentials are intentionally rejected from editable store settings.
- Recharts was not added because the project does not currently include it; dashboard charts are lightweight local components using real backend data.
