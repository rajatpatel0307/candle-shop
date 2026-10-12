# Module 3: Inventory Management Phase 1 Analysis

## Scope

This phase inspects the existing project and defines the inventory architecture before implementing database, API, reservation, frontend, or test changes.

The Module 3 prompt proposes new inventory tables, but the existing candle e-commerce baseline already contains inventory-related tables. The implementation must reuse those tables and their existing column names instead of creating conflicting duplicates.

## Existing Project Architecture

### Backend

- Runtime: Node.js, Express, ES modules.
- API base path: `/api/v1`.
- Database: MSSQL through shared `getPool()` and `sql` in `backend/src/config/database.js`.
- Mounted routes currently include:
  - `/api/v1/health`
  - `/api/v1/auth`
  - `/api/v1/store`
  - `/api/v1/admin`
- Module 1 auth is available through:
  - `authenticate`
  - `authorizeRoles`
  - roles: `ADMIN`, `SUPPORT`, `CUSTOMER`
- Existing admin CRUD metadata already exposes:
  - `inventory`
  - `inventory-movements`
  - `inventory-reservations`
- Storefront product detail already reads inventory availability from `dbo.Inventory.AvailableQuantity`.

### Frontend

- Runtime: React, Vite, JavaScript.
- Styling: Tailwind CSS.
- Data access: shared Axios `apiClient` with `/api/v1` base URL and auth refresh handling.
- Auth state: Redux Toolkit from Module 1.
- Admin UI currently lives mostly inside `frontend/src/App.jsx`.
- Existing admin dashboard groups stock resources under:
  - `inventory`
  - `inventory-movements`
  - `inventory-reservations`
- Current admin resource pages are generic table/form screens; Module 3 should replace stock operations with dedicated inventory screens.

## Existing Schema Compatibility

The existing schema already has these inventory and commerce tables:

- `dbo.Inventory`
  - Primary key: `ProductVariantId`
  - Existing fields used by admin metadata:
    - `ProductVariantId`
    - `OnHandQuantity`
    - `ReservedQuantity`
    - `ReorderLevel`
    - `AvailableQuantity`
  - Existing storefront usage:
    - joined by `Inventory.ProductVariantId = ProductVariants.ProductVariantId`
    - exposes `AvailableQuantity` on product detail variants

- `dbo.InventoryMovements`
  - Primary key: `InventoryMovementId`
  - Existing fields used by admin metadata:
    - `ProductVariantId`
    - `MovementType`
    - `QuantityChange`
    - `ReferenceType`
    - `ReferenceId`
    - `Notes`
    - `CreatedByUserId`
    - `CreatedAtUtc`

- `dbo.InventoryReservations`
  - Primary key: `InventoryReservationId`
  - Existing fields used by admin metadata:
    - `ProductVariantId`
    - `CartId`
    - `OrderId`
    - `Quantity`
    - `ReservationStatus`
    - `ExpiresAtUtc`

- Related tables:
  - `dbo.Products`
  - `dbo.ProductVariants`
  - `dbo.ProductImages`
  - `dbo.Carts`
  - `dbo.CartItems`
  - `dbo.CheckoutSessions`
  - `dbo.Orders`
  - `dbo.OrderItems`
  - `dbo.Users`
  - `dbo.AuditLogs`

## Schema Differences From Module 3 Prompt

The prompt proposes table and column names such as `Inventory.Id`, `ProductId`, `VariantId`, `StockQuantity`, `IdempotencyKey`, `InventoryMovements.Id`, and `InventoryReservations.Id`.

The current baseline should remain the source of truth:

- `Inventory.Id` should map to existing `Inventory.ProductVariantId`.
- `Inventory.ProductId` should be reached through `ProductVariants.ProductId`, not duplicated on `Inventory`.
- `Inventory.VariantId` should map to existing `ProductVariantId`.
- `StockQuantity` should map to `OnHandQuantity`.
- `AvailableStock` should map to existing `AvailableQuantity` or be calculated as `OnHandQuantity - ReservedQuantity`.
- `InventoryMovements.Id` should map to `InventoryMovementId`.
- `InventoryMovements.InventoryId` should map to `ProductVariantId`.
- `InventoryMovements.Quantity` and movement direction should map to signed `QuantityChange`.
- `InventoryMovements.Reason` should map to `Notes`.
- `InventoryMovements.PerformedBy` should map to `CreatedByUserId`.
- `InventoryReservations.Id` should map to `InventoryReservationId`.
- `InventoryReservations.InventoryId` should map to `ProductVariantId`.
- `InventoryReservations.Status` should map to `ReservationStatus`.

Potential future migrations should be additive and safe:

- Add `Inventory.ReorderQuantity` if purchasing workflows require suggested replenishment.
- Add `InventoryMovements.IdempotencyKey` for retry-safe receipts, adjustments, and order deductions.
- Add `InventoryMovements.PreviousOnHandQuantity` and `NewOnHandQuantity` if the baseline does not already store stock snapshots.
- Add `InventoryReservations.SessionId` if guest checkout reservations need non-cart session ownership.
- Add `InventoryReservations.ReleasedAtUtc`, `ConfirmedAtUtc`, `CreatedByUserId`, and `UpdatedAtUtc` if absent.
- Add filtered indexes for active reservations and expiration processing.

These should not replace the existing tables.

## Proposed Backend Inventory Architecture

Create a dedicated module at `backend/src/modules/inventory/`:

- `inventory.routes.js`
- `inventory.controller.js`
- `inventory.service.js`
- `inventory.repository.js`
- `inventory.validation.js`
- `inventory.policy.js`
- `inventory.constants.js`
- `inventory.utils.js`
- `inventory.reservation.service.js`
- `inventory.movement.service.js`
- `index.js`

Mount the module in `backend/src/routes/index.js` as:

- `/api/v1/inventory`

### Authorization

- All inventory endpoints require `authenticate`.
- Inventory list, detail, alerts, movements, and reservations require `ADMIN` or `SUPPORT`.
- Receipts, manual adjustments, confirmation, release, and expiration require `ADMIN`.
- Customer checkout reservation should later be exposed through checkout/cart service methods, not public admin inventory routes.

### Public Route Shape

Use `/api/v1/inventory`, not `/api/inventory`, to match the existing API base path.

Recommended admin endpoints:

- `GET /api/v1/inventory`
- `GET /api/v1/inventory/summary`
- `GET /api/v1/inventory/low-stock`
- `GET /api/v1/inventory/out-of-stock`
- `GET /api/v1/inventory/:productVariantId`
- `PATCH /api/v1/inventory/:productVariantId/reorder`
- `POST /api/v1/inventory/:productVariantId/receipts`
- `POST /api/v1/inventory/:productVariantId/adjustments`
- `GET /api/v1/inventory/:productVariantId/movements`
- `GET /api/v1/inventory/movements`
- `POST /api/v1/inventory/reservations`
- `GET /api/v1/inventory/reservations`
- `GET /api/v1/inventory/reservations/:reservationId`
- `POST /api/v1/inventory/reservations/:reservationId/release`
- `POST /api/v1/inventory/reservations/:reservationId/confirm`
- `POST /api/v1/inventory/reservations/expire`

The expiration endpoint must be protected by `ADMIN` or a later internal job secret; it should not be public.

## Inventory Consistency Rules

Use `ProductVariantId` as the stock identity.

Available stock:

```text
AvailableQuantity = OnHandQuantity - ReservedQuantity
```

Required invariants:

- `OnHandQuantity >= 0`
- `ReservedQuantity >= 0`
- `ReservedQuantity <= OnHandQuantity`
- one inventory row per active stock-managed `ProductVariantId`
- all stock-changing operations run inside SQL transactions
- movement history is append-only during ordinary operations
- reservations do not create physical stock deductions until confirmed

## Transaction Strategy

### Receipts

- Begin transaction.
- Lock or atomically update one `Inventory` row by `ProductVariantId`.
- Increase `OnHandQuantity`.
- Keep `ReservedQuantity` unchanged.
- Insert `InventoryMovements` with `MovementType = 'RECEIPT'` and positive `QuantityChange`.
- Commit.

### Adjustments

- Begin transaction.
- For increases, add to `OnHandQuantity` and record `ADJUSTMENT_IN`.
- For decreases, update only when `OnHandQuantity - @quantity >= ReservedQuantity`.
- Record `ADJUSTMENT_OUT` with negative `QuantityChange`.
- Require `Notes`.
- Commit.

### Reservation

Use a conditional atomic update to prevent overselling:

```sql
UPDATE dbo.Inventory
SET ReservedQuantity = ReservedQuantity + @quantity
WHERE ProductVariantId = @productVariantId
  AND OnHandQuantity - ReservedQuantity >= @quantity;
```

If affected rows is zero, reject with `409 INSUFFICIENT_STOCK`.

Insert `InventoryReservations` with `ReservationStatus = 'ACTIVE'` in the same transaction.

### Confirmation

- Lock the active reservation.
- Reject expired, released, or already confirmed reservations.
- Decrease `OnHandQuantity` and `ReservedQuantity` by the reservation quantity.
- Mark reservation `CONFIRMED`.
- Insert `ORDER_DEDUCTION` movement.
- Commit.

### Release Or Expiration

- Lock the active reservation.
- Decrease `ReservedQuantity`.
- Mark reservation `RELEASED` or `EXPIRED`.
- Commit.
- Do not create a physical stock movement unless the baseline has a dedicated reservation audit event type.

## Proposed Frontend Inventory Architecture

The prompt asks for `frontend/src/admin/inventory/`. That is acceptable, but it should integrate with the current `App.jsx` admin routing first and later be extracted from the monolithic app shell.

Create:

- `frontend/src/admin/inventory/api/inventoryApi.js`
- `frontend/src/admin/inventory/components/InventoryTable.jsx`
- `frontend/src/admin/inventory/components/InventorySummaryCards.jsx`
- `frontend/src/admin/inventory/components/InventoryFilters.jsx`
- `frontend/src/admin/inventory/components/StockReceiptForm.jsx`
- `frontend/src/admin/inventory/components/StockAdjustmentForm.jsx`
- `frontend/src/admin/inventory/components/StockReservationTable.jsx`
- `frontend/src/admin/inventory/components/InventoryMovementHistory.jsx`
- `frontend/src/admin/inventory/components/LowStockAlerts.jsx`
- `frontend/src/admin/inventory/components/InventoryPagination.jsx`
- `frontend/src/admin/inventory/pages/InventoryDashboard.jsx`
- `frontend/src/admin/inventory/pages/InventoryListPage.jsx`
- `frontend/src/admin/inventory/pages/InventoryDetailsPage.jsx`
- `frontend/src/admin/inventory/pages/StockReceiptsPage.jsx`
- `frontend/src/admin/inventory/pages/StockAdjustmentsPage.jsx`
- `frontend/src/admin/inventory/pages/InventoryMovementsPage.jsx`
- `frontend/src/admin/inventory/pages/InventoryReservationsPage.jsx`
- `frontend/src/admin/inventory/hooks/useInventory.js`
- `frontend/src/admin/inventory/hooks/useInventoryMovements.js`
- `frontend/src/admin/inventory/schemas/inventorySchemas.js`
- `frontend/src/admin/inventory/utils/inventoryHelpers.js`
- `frontend/src/admin/inventory/index.js`

Recommended routes:

- `/admin/inventory-dashboard`
- `/admin/inventory`
- `/admin/inventory/:productVariantId`
- `/admin/inventory/:productVariantId/receipts`
- `/admin/inventory/:productVariantId/adjustments`
- `/admin/inventory/movements`
- `/admin/inventory-reservations`

Because the current generic admin route already uses `/admin/:resourceKey`, dedicated routes must be declared before `/admin/:resourceKey`.

## Entity Relationship Summary

```text
Products 1 -> many ProductVariants
ProductVariants 1 -> 1 Inventory
ProductVariants 1 -> many InventoryMovements
ProductVariants 1 -> many InventoryReservations
Carts 1 -> many InventoryReservations
Orders 1 -> many InventoryReservations
Users 1 -> many InventoryMovements as CreatedByUserId
```

## Implementation Plan

### Phase 2: Database

- Verify exact table definitions in the installed `CandleEcommerce` database.
- Add only missing constraints, columns, and indexes.
- Preserve existing `ProductVariantId` inventory identity.
- Add idempotency columns if missing.
- Add indexes for:
  - low-stock queries
  - active reservation lookup
  - expiration processing
  - movement history by variant and created date

### Phase 3: Backend

- Implement `backend/src/modules/inventory`.
- Use Zod schemas for query params and mutation bodies.
- Use transactions for receipts, adjustments, reservation, confirmation, release, and expiration.
- Use allowlisted sorting and server-side pagination.
- Return standardized success/error responses through existing error middleware.
- Add service interfaces that future checkout/order modules can call directly.

### Phase 4: Reservation Engine

- Implement idempotency for reservation-changing calls.
- Prevent duplicate confirmation and duplicate release.
- Reject confirmation of expired reservations.
- Implement expiration processing in bounded batches.
- Add concurrency tests around conditional update behavior.

### Phase 5: Frontend

- Build dedicated admin inventory dashboard and list/detail pages.
- Reuse `apiClient`, `RoleGuard`, Tailwind classes, and admin shell patterns.
- Use backend values as authoritative stock quantities.
- Add loading, empty, error, and success states.
- Add confirmation dialogs for receipts, adjustments, release, confirmation, and expiration.

### Phase 6: Testing

- Add validation unit tests.
- Add repository/service tests with mocked repositories where real SQL is not available.
- Add integration tests against a dedicated test database when available.
- Cover overselling prevention, duplicate requests, rollback, authorization, low stock, and out-of-stock behavior.

### Phase 7: Documentation

- Add API examples.
- Add local setup instructions.
- Add operational checklist for stock reconciliation and reservation expiration jobs.

## Current Blockers

- The repo still does not include the full baseline `001_candle_ecommerce_schema.sql`, so exact constraints and computed-column definitions must be verified from the local MSSQL database before Phase 2.
- The current frontend admin is still monolithic in `App.jsx`; dedicated inventory pages should be introduced carefully before the catch-all `/admin/:resourceKey` route.
- Cart, checkout, and orders exist in schema metadata, but dedicated backend order/checkout modules are not implemented yet. Inventory should expose service methods for those future modules instead of inventing order workflow behavior now.
- Idempotency fields may be missing from the existing baseline and should be added through a safe migration in Phase 2.
