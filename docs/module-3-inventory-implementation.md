# Module 3: Inventory Management Implementation

## What Was Added

### Database

- `database/migrations/003_inventory_management.sql`
- `backend/src/scripts/applyInventoryMigrations.js`
- `npm run db:migrate:inventory`

The migration is additive. It preserves the baseline inventory tables and adds missing operational fields for idempotency, reservation status timestamps, reorder quantity, and movement stock snapshots.

Run from `backend`:

```bash
npm run db:migrate:inventory
```

### Backend

Inventory module:

- `backend/src/modules/inventory/inventory.routes.js`
- `backend/src/modules/inventory/inventory.controller.js`
- `backend/src/modules/inventory/inventory.service.js`
- `backend/src/modules/inventory/inventory.repository.js`
- `backend/src/modules/inventory/inventory.validation.js`
- `backend/src/modules/inventory/inventory.policy.js`
- `backend/src/modules/inventory/inventory.constants.js`
- `backend/src/modules/inventory/inventory.utils.js`
- `backend/src/modules/inventory/inventory.reservation.service.js`
- `backend/src/modules/inventory/inventory.movement.service.js`
- `backend/src/modules/inventory/index.js`

Mounted at:

```text
/api/v1/inventory
```

### Frontend

Inventory admin module:

- `frontend/src/admin/inventory/api/inventoryApi.js`
- `frontend/src/admin/inventory/components/*`
- `frontend/src/admin/inventory/hooks/*`
- `frontend/src/admin/inventory/pages/*`
- `frontend/src/admin/inventory/schemas/inventorySchemas.js`
- `frontend/src/admin/inventory/utils/inventoryHelpers.js`
- `frontend/src/admin/inventory/index.js`

Admin routes:

```text
/admin/inventory-dashboard
/admin/inventory
/admin/inventory/:productVariantId
/admin/inventory/:productVariantId/receipts
/admin/inventory/:productVariantId/adjustments
/admin/inventory-movements
/admin/inventory-reservations
```

## API Endpoints

All endpoints require authentication.

Read endpoints allow `ADMIN` and `SUPPORT`. Stock-changing endpoints require `ADMIN`.

```text
GET    /api/v1/inventory
GET    /api/v1/inventory/summary
GET    /api/v1/inventory/low-stock
GET    /api/v1/inventory/out-of-stock
GET    /api/v1/inventory/movements
GET    /api/v1/inventory/:productVariantId
PATCH  /api/v1/inventory/:productVariantId/reorder
POST   /api/v1/inventory/:productVariantId/receipts
POST   /api/v1/inventory/:productVariantId/adjustments
GET    /api/v1/inventory/:productVariantId/movements
POST   /api/v1/inventory/reservations
GET    /api/v1/inventory/reservations
GET    /api/v1/inventory/reservations/:reservationId
POST   /api/v1/inventory/reservations/:reservationId/release
POST   /api/v1/inventory/reservations/:reservationId/confirm
POST   /api/v1/inventory/reservations/expire
```

## Example Requests

Receipt:

```json
{
  "quantity": 20,
  "referenceType": "PurchaseOrder",
  "notes": "Received from supplier",
  "idempotencyKey": "11111111-1111-4111-8111-111111111111"
}
```

Adjustment:

```json
{
  "type": "OUT",
  "quantity": 2,
  "reason": "Damaged during handling",
  "idempotencyKey": "22222222-2222-4222-8222-222222222222"
}
```

Reservation:

```json
{
  "productVariantId": "33333333-3333-4333-8333-333333333333",
  "quantity": 1,
  "expiresInMinutes": 30,
  "idempotencyKey": "44444444-4444-4444-8444-444444444444"
}
```

## Consistency Rules

- `ProductVariantId` is the inventory identity.
- Available stock is `OnHandQuantity - ReservedQuantity`.
- Reservations use a conditional atomic SQL update to prevent overselling.
- Receipts, adjustments, reservations, confirmation, release, and expiration are transactional.
- Movement records are append-only during ordinary operations.
- Manual stock decreases cannot reduce physical stock below reserved stock.
- Confirmation reduces both physical and reserved stock exactly once.
- Release and expiration reduce reserved stock without physical deduction.

## Verification

Executed:

```bash
cd backend
npm test

cd ../frontend
npm run build
```

Both passed.

## Operational Checklist

- Run the baseline MSSQL schema first.
- Run `npm run db:migrate:inventory` from `backend`.
- Restart backend after migration.
- Sign in as an `ADMIN` user.
- Open `/admin/inventory-dashboard`.
- Use receipts for incoming stock.
- Use adjustments only for manual corrections with clear reasons.
- Run reservation expiration regularly through an internal job or the protected admin endpoint.
- Reconcile `Inventory.OnHandQuantity`, active reservations, and movement history during operations.
