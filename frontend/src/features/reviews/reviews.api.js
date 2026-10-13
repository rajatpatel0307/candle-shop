import { apiClient } from '../../services/apiClient.js';
export const reviewsApi = {
  list: (productId, params) => apiClient.get(`/products/${productId}/reviews`, { params }),
  summary: (productId) => apiClient.get(`/products/${productId}/reviews/summary`),
  create: (productId, payload) => apiClient.post(`/products/${productId}/reviews`, payload),
  mine: () => apiClient.get('/reviews/my-reviews'),
  update: (reviewId, payload) => apiClient.patch(`/reviews/${reviewId}`, payload),
  remove: (reviewId) => apiClient.delete(`/reviews/${reviewId}`),
};
