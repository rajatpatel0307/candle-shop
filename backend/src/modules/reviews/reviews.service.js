import * as audit from '../admin/admin.audit.service.js';
import { AppError } from '../../common/errors/AppError.js';
import * as notifications from '../notifications/notifications.service.js';
import { reviewModeratedNotification } from '../notifications/notifications.factory.js';
import * as repo from './reviews.repository.js';

export async function listApproved(productId, query) {
  const result = await repo.listApproved(productId, query);
  return { items: result.rows, pagination: { page: query.page, limit: query.limit, total: result.total } };
}

export async function summary(productId) {
  return repo.summary(productId);
}

export async function create(userId, productId, input) {
  const verified = await repo.hasVerifiedPurchase({ userId, productId, orderItemId: input.orderItemId });
  if (!verified) throw new AppError(403, 'REVIEW_NOT_ELIGIBLE', 'You can review this product after your order is delivered.');
  return repo.createReview({ userId, productId, input, verified });
}

export async function eligibility(userId, productId) {
  const [purchase, review] = await Promise.all([repo.hasVerifiedPurchase({ userId, productId }), repo.findMineForProduct(userId, productId)]);
  return { canReview: Boolean(purchase), orderItemId: purchase?.OrderItemId || null, review,
    message: purchase ? 'Share your experience with your delivered product.' : 'Reviews are available after your order is delivered.' };
}

export async function mine(userId, query) {
  const result = await repo.listMine(userId, query);
  return { items: result.rows, pagination: { page: query.page, limit: query.limit, total: result.total } };
}

export async function update(userId, reviewId, input) {
  const review = await repo.updateMine({ reviewId, userId, input });
  if (!review) throw new AppError(404, 'REVIEW_NOT_FOUND', 'Review was not found.');
  return review;
}

export async function remove(userId, reviewId) {
  const deleted = await repo.deleteMine({ reviewId, userId });
  if (!deleted) throw new AppError(404, 'REVIEW_NOT_FOUND', 'Review was not found.');
  return { deleted: true };
}

export async function listAdmin(query) {
  const result = await repo.listAdmin(query);
  return { items: result.rows, pagination: { page: query.page, limit: query.limit, total: result.total } };
}

export async function moderate(reviewId, input, moderatorId) {
  const review = await repo.moderate({ reviewId, status: input.status, moderatorId });
  if (!review) throw new AppError(404, 'REVIEW_NOT_FOUND', 'Review was not found.');
  await audit.record({ userId: moderatorId, action: 'REVIEW_VISIBILITY_CHANGE', entityName: 'ProductReviews', entityId: reviewId, details: { status: input.status, reason: input.reason || null } });
  await notifications.createNotification(reviewModeratedNotification(review, input.status));
  return review;
}
