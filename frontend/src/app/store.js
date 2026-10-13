import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/store/authSlice.js';
import cartReducer from '../features/cart/store/cartSlice.js';
import wishlistReducer from '../features/wishlist/store/wishlistSlice.js';
import checkoutReducer from '../features/checkout/store/checkoutSlice.js';
import ordersReducer from '../features/orders/store/ordersSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    checkout: checkoutReducer,
    orders: ordersReducer,
  },
});
