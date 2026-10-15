import { Router } from 'express';
import { asyncHandler } from '../../common/middleware/asyncHandler.js';
import { authenticate } from '../auth/auth.middleware.js';
import { requireCustomer } from './checkout.policy.js';
import {
  applyDiscount,
  createSession,
  createAddress,
  getSession,
  getSummary,
  removeDiscount,
  submit,
  updateAddresses,
  updateShippingMethod,
  validateCheckout,
} from './checkout.controller.js';

const router = Router();

router.use(authenticate, requireCustomer);
router.post('/addresses', asyncHandler(createAddress));

router.post('/session', asyncHandler(createSession));
router.get('/session/:id', asyncHandler(getSession));
router.put('/session/:id/addresses', asyncHandler(updateAddresses));
router.put('/session/:id/shipping-method', asyncHandler(updateShippingMethod));
router.post('/session/:id/apply-discount', asyncHandler(applyDiscount));
router.post('/session/:id/remove-discount', asyncHandler(removeDiscount));
router.get('/session/:id/summary', asyncHandler(getSummary));
router.post('/session/:id/validate', asyncHandler(validateCheckout));
router.post('/session/:id/submit', asyncHandler(submit));

export default router;
