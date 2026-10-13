import { Router } from 'express';
import { asyncHandler } from '../../common/middleware/asyncHandler.js';
import { authenticate } from '../auth/auth.middleware.js';
import { approve, createRefund, getRefund, listAdmin, listByOrder, retry } from './refunds.controller.js';
import { requireRefundAdmin } from './refunds.policy.js';

const router = Router();
router.use(authenticate, requireRefundAdmin);

router.get('/admin', asyncHandler(listAdmin));
router.post('/orders/:orderId', asyncHandler(createRefund));
router.get('/orders/:orderId', asyncHandler(listByOrder));
router.get('/:refundId', asyncHandler(getRefund));
router.post('/:refundId/approve', asyncHandler(approve));
router.post('/:refundId/retry', asyncHandler(retry));

export default router;
