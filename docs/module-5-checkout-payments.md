# Module 5: Checkout And Payments

## Implemented

- Backend checkout module mounted at `/api/v1/checkout`.
- Backend payments module mounted at `/api/v1/payments`.
- Additive MSSQL migration: `database/migrations/005_checkout_payments.sql`.
- Migration runner: `npm run db:migrate:checkout-payments` from `backend`.
- Frontend checkout feature under `frontend/src/features/checkout`.
- Razorpay adapter isolated in `payments.gateway.service.js`.
- Signed webhook processing with raw request bytes captured in Express JSON `verify`.
- Idempotency controls for checkout sessions, orders, payments, and webhook events.

## Checkout API

```text
POST /api/v1/checkout/session
GET /api/v1/checkout/session/:id
PUT /api/v1/checkout/session/:id/addresses
PUT /api/v1/checkout/session/:id/shipping-method
POST /api/v1/checkout/session/:id/apply-discount
POST /api/v1/checkout/session/:id/remove-discount
GET /api/v1/checkout/session/:id/summary
POST /api/v1/checkout/session/:id/validate
POST /api/v1/checkout/session/:id/submit
```

## Payments API

```text
POST /api/v1/payments/orders/:orderId/intent
GET /api/v1/payments/orders/:orderId/status
POST /api/v1/payments/orders/:orderId/verify
POST /api/v1/payments/orders/:orderId/retry
POST /api/v1/payments/webhooks/razorpay
```

## Environment

```text
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

When Razorpay keys are absent, the backend returns a non-charging manual next action so local checkout can be exercised without real credentials. It will not mark payments as paid without a valid verification or signed webhook.

## ERD

```text
Users 1 -> many UserAddresses
Users 1 -> many Carts
Carts 1 -> many CartItems
Carts 1 -> many CheckoutSessions
CheckoutSessions 0/1 -> 1 Orders
Orders 1 -> many OrderItems
Orders 1 -> many OrderAddresses
Orders 1 -> many Payments
Orders 1 -> many PaymentAttempts
Orders 1 -> many InventoryReservations
Payments 1 -> many Refunds
PaymentWebhookEvents records provider events independently by unique provider event id
```

## Setup

```bash
cd backend
npm run db:migrate:inventory
npm run db:migrate:cart-wishlist
npm run db:migrate:checkout-payments
npm test

cd ../frontend
npm run build
```

## Production Checklist

- Configure real Razorpay test credentials, then production credentials.
- Configure Razorpay webhook URL to `/api/v1/payments/webhooks/razorpay`.
- Set and rotate `RAZORPAY_WEBHOOK_SECRET`.
- Confirm baseline schema columns match the additive migration assumptions.
- Add configured tax rules before charging tax.
- Replace the temporary shipping policy with business-approved shipping zones/rates.
- Monitor failed webhook rows and pending payment reconciliation.
- Keep payment secret keys server-side only.
