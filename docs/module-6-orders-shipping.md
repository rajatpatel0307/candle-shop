# Module 6: Orders And Shipping

## Implemented

- Customer orders API at `/api/v1/orders`.
- Admin order management API at `/api/v1/orders/admin`.
- Refund workflow at `/api/v1/refunds`.
- Manual shipment and tracking API at `/api/v1/shipping`.
- Additive MSSQL migration: `database/migrations/006_orders_shipping_refunds.sql`.
- Frontend customer order pages under `frontend/src/features/orders`.
- Frontend admin order pages under `frontend/src/admin/orders`.

## API Summary

Customer:

```text
GET /api/v1/orders
GET /api/v1/orders/:orderId
GET /api/v1/orders/:orderId/status
GET /api/v1/orders/:orderId/tracking
POST /api/v1/orders/:orderId/cancel
GET /api/v1/orders/:orderId/cancellation
POST /api/v1/orders/:orderId/cancellation-request
```

Admin:

```text
GET /api/v1/orders/admin
GET /api/v1/orders/admin/:orderId
PATCH /api/v1/orders/admin/:orderId/status
POST /api/v1/orders/admin/:orderId/cancel
GET /api/v1/orders/admin/:orderId/history
GET /api/v1/orders/admin/:orderId/cancellations
```

Shipping:

```text
POST /api/v1/shipping/orders/:orderId/shipments
GET /api/v1/shipping/orders/:orderId/shipments
GET /api/v1/shipping/shipments/:shipmentId
PATCH /api/v1/shipping/shipments/:shipmentId
POST /api/v1/shipping/shipments/:shipmentId/dispatch
GET /api/v1/shipping/shipments/:shipmentId/tracking
POST /api/v1/shipping/shipments/:shipmentId/tracking-events
```

Refunds:

```text
POST /api/v1/refunds/orders/:orderId
GET /api/v1/refunds/orders/:orderId
GET /api/v1/refunds/:refundId
POST /api/v1/refunds/:refundId/approve
POST /api/v1/refunds/:refundId/retry
GET /api/v1/refunds/admin
```

## ERD

```text
Orders 1 -> many OrderItems
Orders 1 -> many OrderAddresses
Orders 1 -> many OrderStatusHistory
Orders 1 -> many OrderCancellationRequests
Orders 1 -> many Shipments
Shipments 1 -> many ShipmentTrackingEvents
Orders 1 -> many Refunds
Payments 1 -> many Refunds
ShippingWebhookEvents deduplicates carrier events by provider and provider event id
```

## Setup

```bash
cd backend
npm run db:migrate:orders-shipping
npm test

cd ../frontend
npm run build
```

## Operational Notes

- Carrier integration is intentionally manual/provider-ready. No live tracking is fabricated.
- Refunds use existing payment records and Razorpay credentials from Module 5 when available.
- Refunds do not mark successful purely from frontend input; provider/manual processing remains authoritative.
- Customer cancellation after payment creates a review path rather than silently refunding.
- Delivered orders are not cancellable through pre-shipment cancellation.
