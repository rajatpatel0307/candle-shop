import { Router } from 'express';
import { asyncHandler } from '../../common/middleware/asyncHandler.js';
import { authenticate } from '../auth/auth.middleware.js';
import { requireReviewAdmin } from '../reviews/reviews.policy.js';
import { announce, list, listAdmin, markAllRead, markRead, unreadCount } from './notifications.controller.js';

const router = Router();
router.use(authenticate);
router.get('/notifications', asyncHandler(list));
router.get('/notifications/unread-count', asyncHandler(unreadCount));
router.patch('/notifications/:notificationId/read', asyncHandler(markRead));
router.patch('/notifications/read-all', asyncHandler(markAllRead));
router.get('/admin/notifications', requireReviewAdmin, asyncHandler(listAdmin));
router.post('/admin/notifications', requireReviewAdmin, asyncHandler(announce));

export default router;
