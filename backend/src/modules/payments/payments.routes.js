import { Router } from 'express';
import { asyncHandler } from '../../common/middleware/asyncHandler.js';
import { authenticate } from '../auth/auth.middleware.js';
import { createIntent, getStatus, retry, verify } from './payments.controller.js';
import { handleWebhook } from './payments.webhook.controller.js';
import { requireCustomer } from './payments.policy.js';

const router = Router();

router.post('/webhooks/:provider', asyncHandler(handleWebhook));

router.use(authenticate, requireCustomer);
router.post('/orders/:orderId/intent', asyncHandler(createIntent));
router.get('/orders/:orderId/status', asyncHandler(getStatus));
router.post('/orders/:orderId/verify', asyncHandler(verify));
router.post('/orders/:orderId/retry', asyncHandler(retry));

export default router;
