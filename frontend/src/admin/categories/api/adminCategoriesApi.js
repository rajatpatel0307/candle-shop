import { apiClient } from '../../../services/apiClient.js';
export const adminCategoriesApi = {
  list: (params) => apiClient.get('/admin/resources/categories', { params }),
  create: (payload) => apiClient.post('/admin/resources/categories', payload),
  update: (categoryId, payload) => apiClient.put(`/admin/resources/categories/${categoryId}`, payload),
  remove: (categoryId) => apiClient.delete(`/admin/resources/categories/${categoryId}`),
};
