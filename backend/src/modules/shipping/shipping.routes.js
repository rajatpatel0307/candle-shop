import { Router } from 'express';
import { asyncHandler } from '../../common/middleware/asyncHandler.js';
import { authenticate } from '../auth/auth.middleware.js';
import { addTrackingEvent, createShipment, dispatchShipment, getShipment, listByOrder, listAdmin, tracking, updateShipment } from './shipping.controller.js';
import { requireShippingAdmin } from './shipping.policy.js';

const router = Router();
router.use(authenticate, requireShippingAdmin);
router.get('/shipments', asyncHandler(listAdmin));

router.post('/orders/:orderId/shipments', asyncHandler(createShipment));
router.get('/orders/:orderId/shipments', asyncHandler(listByOrder));
router.get('/shipments/:shipmentId', asyncHandler(getShipment));
router.patch('/shipments/:shipmentId', asyncHandler(updateShipment));
router.post('/shipments/:shipmentId/dispatch', asyncHandler(dispatchShipment));
router.get('/shipments/:shipmentId/tracking', asyncHandler(tracking));
router.post('/shipments/:shipmentId/tracking-events', asyncHandler(addTrackingEvent));

export default router;
