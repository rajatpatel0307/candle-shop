# Module 4: Cart And Wishlist Implementation

## What Was Added

### Database

- `database/migrations/004_cart_wishlist.sql`
- `backend/src/scripts/applyCartWishlistMigrations.js`
- `npm run db:migrate:cart-wishlist`

The migration preserves the existing baseline tables:

- `Carts`
- `CartItems`
- `Wishlists`
- `WishlistItems`

It adds safe constraints and indexes for active carts, duplicate cart items, default wishlists, duplicate wishlist items, and positive quantities.

Run from `backend`:

```bash
npm run db:migrate:cart-wishlist
```

### Backend

Cart module:

- `backend/src/modules/carts/carts.routes.js`
- `backend/src/modules/carts/carts.controller.js`
- `backend/src/modules/carts/carts.service.js`
- `backend/src/modules/carts/carts.repository.js`
- `backend/src/modules/carts/carts.validation.js`
- `backend/src/modules/carts/carts.policy.js`
- `backend/src/modules/carts/carts.constants.js`
- `backend/src/modules/carts/carts.utils.js`
- `backend/src/modules/carts/carts.pricing.service.js`
- `backend/src/modules/carts/carts.validation.service.js`

Wishlist module:

- `backend/src/modules/wishlists/wishlists.routes.js`
- `backend/src/modules/wishlists/wishlists.controller.js`
- `backend/src/modules/wishlists/wishlists.service.js`
- `backend/src/modules/wishlists/wishlists.repository.js`
- `backend/src/modules/wishlists/wishlists.validation.js`
- `backend/src/modules/wishlists/wishlists.policy.js`
- `backend/src/modules/wishlists/wishlists.constants.js`

Mounted routes:

```text
/api/v1/carts
/api/v1/wishlists
```

### Frontend

Cart feature:

- `frontend/src/features/cart/api/cartApi.js`
- `frontend/src/features/cart/components/*`
- `frontend/src/features/cart/hooks/*`
- `frontend/src/features/cart/pages/CartPage.jsx`
- `frontend/src/features/cart/store/cartSlice.js`
- `frontend/src/features/cart/index.js`

Wishlist feature:

- `frontend/src/features/wishlist/api/wishlistApi.js`
- `frontend/src/features/wishlist/components/*`
- `frontend/src/features/wishlist/hooks/useWishlist.js`
- `frontend/src/features/wishlist/pages/WishlistPage.jsx`
- `frontend/src/features/wishlist/store/wishlistSlice.js`
- `frontend/src/features/wishlist/index.js`

Routes:

```text
/cart
/wishlist
```

Both routes require authentication through the existing `AuthGuard`.

## API Endpoints

Cart:

```text
GET    /api/v1/carts
POST   /api/v1/carts/items
PATCH  /api/v1/carts/items/:itemId
DELETE /api/v1/carts/items/:itemId
DELETE /api/v1/carts
GET    /api/v1/carts/summary
POST   /api/v1/carts/validate
GET    /api/v1/carts/availability
```

Wishlist:

```text
GET    /api/v1/wishlists
GET    /api/v1/wishlists/:id/items
POST   /api/v1/wishlists/items
DELETE /api/v1/wishlists/items/:itemId
DELETE /api/v1/wishlists/items/by-product/:productId
POST   /api/v1/wishlists/items/:itemId/move-to-cart
```

## Business Rules

- Cart and wishlist operations use `req.user.id`; client-supplied user IDs are not accepted.
- Cart validates active product, active variant, current price, and current inventory availability.
- Cart does not reserve inventory.
- Duplicate cart entries merge quantity for the same variant.
- Wishlist prevents duplicate product or variant entries.
- Move-to-cart adds through the cart service first and only removes the wishlist item after the cart operation succeeds.
- Checkout validation returns current price, availability, quantity issues, unavailable items, subtotal, and validity.

## Verification

Run:

```bash
cd backend
npm test

cd ../frontend
npm run build
```

## Operational Checklist

- Run the baseline database schema first.
- Run `npm run db:migrate:inventory` if Module 3 migration has not been applied.
- Run `npm run db:migrate:cart-wishlist`.
- Restart backend.
- Sign in as a customer.
- Add an active product variant to cart from product detail.
- Open `/cart` and validate the cart before checkout.
- Save products to `/wishlist`.
- Move wishlist items to cart to verify integration.
