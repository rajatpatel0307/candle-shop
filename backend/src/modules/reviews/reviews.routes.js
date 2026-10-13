import { Router } from 'express';
import { asyncHandler } from '../../common/middleware/asyncHandler.js';
import { authenticate } from '../auth/auth.middleware.js';
import { create, listAdmin, listApproved, mine, moderate, remove, summary, update } from './reviews.controller.js';
import { requireCustomer, requireReviewAdmin } from './reviews.policy.js';

const router = Router();

router.get('/products/:productId/reviews', asyncHandler(listApproved));
router.get('/products/:productId/reviews/summary', asyncHandler(summary));
router.post('/products/:productId/reviews', authenticate, requireCustomer, asyncHandler(create));
router.get('/reviews/my-reviews', authenticate, requireCustomer, asyncHandler(mine));
router.patch('/reviews/:reviewId', authenticate, requireCustomer, asyncHandler(update));
router.delete('/reviews/:reviewId', authenticate, requireCustomer, asyncHandler(remove));
router.get('/admin/reviews', authenticate, requireReviewAdmin, asyncHandler(listAdmin));
router.patch('/admin/reviews/:reviewId/moderation', authenticate, requireReviewAdmin, asyncHandler(moderate));

export default router;
