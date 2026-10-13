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

test('moderationSchema accepts approved status', () => {
  assert.equal(moderationSchema.parse({ status: 'APPROVED' }).status, 'APPROVED');
});
