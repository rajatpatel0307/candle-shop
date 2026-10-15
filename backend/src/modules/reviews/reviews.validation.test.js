import test from 'node:test';
import assert from 'node:assert/strict';
import { moderationSchema, reviewCreateSchema } from './reviews.validation.js';

test('reviewCreateSchema validates rating and text', () => {
  const parsed = reviewCreateSchema.parse({ rating: 5, comment: 'Beautiful scent and clean burn.' });
  assert.equal(parsed.rating, 5);
});

test('reviewCreateSchema rejects invalid rating', () => {
  assert.equal(reviewCreateSchema.safeParse({ rating: 6, comment: 'Invalid rating text.' }).success, false);
});

test('review order item IDs match numeric SQL identities', () => {
  assert.equal(reviewCreateSchema.parse({rating:4,comment:'A lovely candle to use.',orderItemId:'42'}).orderItemId,42);
  assert.equal(reviewCreateSchema.safeParse({rating:4,comment:'A lovely candle to use.',orderItemId:'11111111-1111-4111-8111-111111111111'}).success,false);
});

test('moderationSchema accepts approved status', () => {
  assert.equal(moderationSchema.parse({ status: 'APPROVED' }).status, 'APPROVED');
});
