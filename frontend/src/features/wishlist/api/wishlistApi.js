import { apiClient } from '../../../services/apiClient.js';
import { endpoints } from '../../../services/endpoints.js';

export const wishlistApi = {
  get: () => apiClient.get(endpoints.wishlist.root),
  addItem: (payload) => apiClient.post(endpoints.wishlist.items, payload),
  removeItem: (itemId) => apiClient.delete(endpoints.wishlist.item(itemId)),
  removeByProduct: (productId) => apiClient.delete(endpoints.wishlist.byProduct(productId)),
  moveToCart: (itemId) => apiClient.post(endpoints.wishlist.moveToCart(itemId)),
};
