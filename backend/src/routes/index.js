import { Router } from 'express';
import healthRoutes from '../modules/health/health.routes.js';
import publicRoutes from '../modules/storefront/storefront.routes.js';
import adminRoutes from '../modules/admin/admin.routes.js';
import authRoutes from '../modules/auth/auth.routes.js';
import inventoryRoutes from '../modules/inventory/inventory.routes.js';
import cartsRoutes from '../modules/carts/carts.routes.js';
import wishlistsRoutes from '../modules/wishlists/wishlists.routes.js';
import checkoutRoutes from '../modules/checkout/checkout.routes.js';
import paymentsRoutes from '../modules/payments/payments.routes.js';
import ordersRoutes from '../modules/orders/orders.routes.js';
import shippingRoutes from '../modules/shipping/shipping.routes.js';
import refundsRoutes from '../modules/refunds/refunds.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/store', publicRoutes);
router.use('/admin', adminRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/carts', cartsRoutes);
router.use('/wishlists', wishlistsRoutes);
router.use('/checkout', checkoutRoutes);
router.use('/payments', paymentsRoutes);
router.use('/orders', ordersRoutes);
router.use('/shipping', shippingRoutes);
router.use('/refunds', refundsRoutes);

export default router;
