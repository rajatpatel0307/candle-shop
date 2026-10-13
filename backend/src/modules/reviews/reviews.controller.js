import * as service from './reviews.service.js';
import { listReviewsSchema, moderationSchema, productIdSchema, reviewCreateSchema, reviewIdSchema, reviewUpdateSchema } from './reviews.validation.js';
import { ok, validate } from '../carts/carts.utils.js';

export async function listApproved(req, res) {
  const { productId } = validate(productIdSchema, req.params);
  ok(res, 'Reviews loaded.', { reviews: await service.listApproved(productId, validate(listReviewsSchema, req.query)) });
}
export async function summary(req, res) {
  const { productId } = validate(productIdSchema, req.params);
  ok(res, 'Review summary loaded.', { summary: await service.summary(productId) });
}
export async function create(req, res) {
  const { productId } = validate(productIdSchema, req.params);
  ok(res.status(201), 'Review submitted.', { review: await service.create(req.user.id, productId, validate(reviewCreateSchema, req.body)) });
}
export async function mine(req, res) {
  ok(res, 'My reviews loaded.', { reviews: await service.mine(req.user.id, validate(listReviewsSchema, req.query)) });
}
export async function update(req, res) {
  const { reviewId } = validate(reviewIdSchema, req.params);
  ok(res, 'Review updated.', { review: await service.update(req.user.id, reviewId, validate(reviewUpdateSchema, req.body)) });
}
export async function remove(req, res) {
  const { reviewId } = validate(reviewIdSchema, req.params);
  ok(res, 'Review deleted.', { result: await service.remove(req.user.id, reviewId) });
}
export async function listAdmin(req, res) {
  ok(res, 'Admin reviews loaded.', { reviews: await service.listAdmin(validate(listReviewsSchema, req.query)) });
}
export async function moderate(req, res) {
  const { reviewId } = validate(reviewIdSchema, req.params);
  ok(res, 'Review moderated.', { review: await service.moderate(reviewId, validate(moderationSchema, req.body), req.user.id) });
}
