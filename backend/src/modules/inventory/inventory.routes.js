import { Router } from 'express';
import { asyncHandler } from '../../common/middleware/asyncHandler.js';
import { authenticate } from '../auth/auth.middleware.js';
import { INVENTORY_ADMIN_ROLES, INVENTORY_ROLES } from './inventory.constants.js';
import {
  confirmReservation,
  createReservation,
  expireReservations,
  getInventory,
  getLowStock,
  getOutOfStock,
  getReservation,
  getSummary,
  listInventory,
  listMovements,
  listReservations,
  listVariantMovements,
  recordAdjustment,
  recordReceipt,
  releaseReservation,
  updateReorder,
} from './inventory.controller.js';
import { authorizeAnyRole } from './inventory.policy.js';

const router = Router();

router.use(authenticate);

router.get('/', authorizeAnyRole(...INVENTORY_ROLES), asyncHandler(listInventory));
router.get('/summary', authorizeAnyRole(...INVENTORY_ROLES), asyncHandler(getSummary));
router.get('/low-stock', authorizeAnyRole(...INVENTORY_ROLES), asyncHandler(getLowStock));
router.get('/out-of-stock', authorizeAnyRole(...INVENTORY_ROLES), asyncHandler(getOutOfStock));
router.get('/movements', authorizeAnyRole(...INVENTORY_ROLES), asyncHandler(listMovements));

router.post('/reservations', authorizeAnyRole(...INVENTORY_ADMIN_ROLES), asyncHandler(createReservation));
router.get('/reservations', authorizeAnyRole(...INVENTORY_ROLES), asyncHandler(listReservations));
router.post('/reservations/expire', authorizeAnyRole(...INVENTORY_ADMIN_ROLES), asyncHandler(expireReservations));
router.get('/reservations/:reservationId', authorizeAnyRole(...INVENTORY_ROLES), asyncHandler(getReservation));
router.post('/reservations/:reservationId/release', authorizeAnyRole(...INVENTORY_ADMIN_ROLES), asyncHandler(releaseReservation));
router.post('/reservations/:reservationId/confirm', authorizeAnyRole(...INVENTORY_ADMIN_ROLES), asyncHandler(confirmReservation));

router.get('/:productVariantId', authorizeAnyRole(...INVENTORY_ROLES), asyncHandler(getInventory));
router.patch('/:productVariantId/reorder', authorizeAnyRole(...INVENTORY_ADMIN_ROLES), asyncHandler(updateReorder));
router.post('/:productVariantId/receipts', authorizeAnyRole(...INVENTORY_ADMIN_ROLES), asyncHandler(recordReceipt));
router.post('/:productVariantId/adjustments', authorizeAnyRole(...INVENTORY_ADMIN_ROLES), asyncHandler(recordAdjustment));
router.get('/:productVariantId/movements', authorizeAnyRole(...INVENTORY_ROLES), asyncHandler(listVariantMovements));

export default router;
