import { apiClient } from '../../../services/apiClient.js';
import { endpoints } from '../../../services/endpoints.js';

export const cartApi = {
  get: () => apiClient.get(endpoints.cart.root),
  summary: () => apiClient.get(endpoints.cart.summary),
  addItem: (payload) => apiClient.post(endpoints.cart.items, payload),
  updateItem: (itemId, payload) => apiClient.patch(endpoints.cart.item(itemId), payload),
  removeItem: (itemId) => apiClient.delete(endpoints.cart.item(itemId)),
  clear: () => apiClient.delete(endpoints.cart.root),
  validate: () => apiClient.post(endpoints.cart.validate),
};
