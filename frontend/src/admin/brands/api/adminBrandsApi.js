import { apiClient } from '../../../services/apiClient.js';
export const adminBrandsApi = {
  list: (params) => apiClient.get('/admin/resources/brands', { params }),
  create: (payload) => apiClient.post('/admin/resources/brands', payload),
  update: (brandId, payload) => apiClient.put(`/admin/resources/brands/${brandId}`, payload),
  remove: (brandId) => apiClient.delete(`/admin/resources/brands/${brandId}`),
};
