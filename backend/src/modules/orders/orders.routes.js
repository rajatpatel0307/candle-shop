import { Router } from 'express';
import { asyncHandler } from '../../common/middleware/asyncHandler.js';
import { authenticate } from '../auth/auth.middleware.js';
import { requireCustomer, requireOrderAdmin } from './orders.policy.js';
import {
  cancelAdmin,
  cancelCustomer,
  getAdminOrder,
  getCancellation,
  getCancellationsAdmin,
  getCustomerOrder,
  getHistory,
  getStatus,
  getTracking,
  listAdmin,
  listCustomer,
  requestCancellation,
  updateStatus,
} from './orders.controller.js';

const router = Router();

router.use(authenticate);

router.get('/admin', requireOrderAdmin, asyncHandler(listAdmin));
router.get('/admin/:orderId', requireOrderAdmin, asyncHandler(getAdminOrder));
router.patch('/admin/:orderId/status', requireOrderAdmin, asyncHandler(updateStatus));
router.post('/admin/:orderId/cancel', requireOrderAdmin, asyncHandler(cancelAdmin));
router.get('/admin/:orderId/history', requireOrderAdmin, asyncHandler(getHistory));
router.get('/admin/:orderId/cancellations', requireOrderAdmin, asyncHandler(getCancellationsAdmin));

router.get('/', requireCustomer, asyncHandler(listCustomer));
router.get('/:orderId', requireCustomer, asyncHandler(getCustomerOrder));
router.get('/:orderId/status', requireCustomer, asyncHandler(getStatus));
router.get('/:orderId/tracking', requireCustomer, asyncHandler(getTracking));
router.post('/:orderId/cancel', requireCustomer, asyncHandler(cancelCustomer));
router.get('/:orderId/cancellation', requireCustomer, asyncHandler(getCancellation));
router.post('/:orderId/cancellation-request', requireCustomer, asyncHandler(requestCancellation));

export default router;
