import { Router } from 'express';
import { asyncHandler } from '../../common/middleware/asyncHandler.js';
import { authenticate } from '../auth/auth.middleware.js';
import { addItem, availability, clearCart, getCart, removeItem, summary, updateItem, validateCurrentCart } from './carts.controller.js';
import { requireCustomer } from './carts.policy.js';

const router = Router();

router.use(authenticate, requireCustomer);

router.get('/', asyncHandler(getCart));
router.get('/summary', asyncHandler(summary));
router.get('/availability', asyncHandler(availability));
router.post('/validate', asyncHandler(validateCurrentCart));
router.post('/items', asyncHandler(addItem));
router.patch('/items/:itemId', asyncHandler(updateItem));
router.delete('/items/:itemId', asyncHandler(removeItem));
router.delete('/', asyncHandler(clearCart));

export default router;
