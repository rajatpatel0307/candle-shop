import { Router } from 'express';
import { asyncHandler } from '../../common/middleware/asyncHandler.js';
import { authenticate } from '../auth/auth.middleware.js';
import { addItem, getWishlist, getWishlistItems, moveToCart, removeByProduct, removeItem } from './wishlists.controller.js';
import { requireCustomer } from './wishlists.policy.js';

const router = Router();

router.use(authenticate, requireCustomer);

router.get('/', asyncHandler(getWishlist));
router.get('/:id/items', asyncHandler(getWishlistItems));
router.post('/items', asyncHandler(addItem));
router.delete('/items/:itemId', asyncHandler(removeItem));
router.delete('/items/by-product/:productId', asyncHandler(removeByProduct));
router.post('/items/:itemId/move-to-cart', asyncHandler(moveToCart));

export default router;
