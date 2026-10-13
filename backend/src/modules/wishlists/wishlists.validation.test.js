import test from 'node:test';
import assert from 'node:assert/strict';
import { addWishlistItemSchema } from './wishlists.validation.js';

test('addWishlistItemSchema accepts product-only wishlist item', () => {
  const parsed = addWishlistItemSchema.safeParse({
    productId: '11111111-1111-4111-8111-111111111111',
  });
  assert.equal(parsed.success, true);
});

test('addWishlistItemSchema rejects invalid product id', () => {
  const parsed = addWishlistItemSchema.safeParse({ productId: 'bad-id' });
  assert.equal(parsed.success, false);
});
