import { Router } from 'express';
import { asyncHandler } from '../../common/middleware/asyncHandler.js';
import { authenticate } from '../auth/auth.middleware.js';
import { requireSupportAdmin } from './support.policy.js';
import { adminDetail, adminList, adminReply, adminUpdate, create, customerStatus, detail, mine, reply } from './support.controller.js';

const router = Router();
router.use(authenticate);
router.post('/support/tickets', asyncHandler(create));
router.get('/support/tickets', asyncHandler(mine));
router.get('/support/tickets/:ticketId', asyncHandler(detail));
router.post('/support/tickets/:ticketId/messages', asyncHandler(reply));
router.patch('/support/tickets/:ticketId/status', asyncHandler(customerStatus));
router.get('/admin/support/tickets', requireSupportAdmin, asyncHandler(adminList));
router.get('/admin/support/tickets/:ticketId', requireSupportAdmin, asyncHandler(adminDetail));
router.post('/admin/support/tickets/:ticketId/messages', requireSupportAdmin, asyncHandler(adminReply));
router.patch('/admin/support/tickets/:ticketId', requireSupportAdmin, asyncHandler(adminUpdate));

export default router;
