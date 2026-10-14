import test from 'node:test';
import assert from 'node:assert/strict';
import { addCartItemSchema, cartItemIdSchema, updateCartItemSchema } from './carts.validation.js';

test('addCartItemSchema accepts a product variant and quantity', () => {
  const parsed = addCartItemSchema.safeParse({
    productVariantId: '11111111-1111-4111-8111-111111111111',
    quantity: 2,
  });
  assert.equal(parsed.success, true);
});

test('addCartItemSchema requires product or variant identity', () => {
  const parsed = addCartItemSchema.safeParse({ quantity: 1 });
  assert.equal(parsed.success, false);
});

test('updateCartItemSchema rejects zero quantity', () => {
  assert.equal(updateCartItemSchema.safeParse({ quantity: 0 }).success, false);
});

test('cartItemIdSchema accepts numeric identity values', () => {
  const parsed = cartItemIdSchema.safeParse({ itemId: '42' });
  assert.equal(parsed.success, true);
  assert.equal(parsed.data.itemId, 42);
});
