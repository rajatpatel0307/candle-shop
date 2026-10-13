import { Router } from 'express';
import { asyncHandler } from '../../common/middleware/asyncHandler.js';
import { authenticate } from '../auth/auth.middleware.js';
import { requireReviewAdmin } from '../reviews/reviews.policy.js';
import { create, getAdmin, listAdmin, mine, replyAdmin, updateAdmin } from './contact.controller.js';

const router = Router();
router.post('/contact', asyncHandler(create));
router.get('/contact/my-messages', authenticate, asyncHandler(mine));
router.get('/admin/contact-messages', authenticate, requireReviewAdmin, asyncHandler(listAdmin));
router.get('/admin/contact-messages/:messageId', authenticate, requireReviewAdmin, asyncHandler(getAdmin));
router.patch('/admin/contact-messages/:messageId', authenticate, requireReviewAdmin, asyncHandler(updateAdmin));
router.post('/admin/contact-messages/:messageId/replies', authenticate, requireReviewAdmin, asyncHandler(replyAdmin));

export default router;
