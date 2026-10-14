import { apiClient } from '../../../services/apiClient.js';
export const adminProductsApi = {
  list: (params) => apiClient.get('/admin/resources/products', { params }),
  categories: () => apiClient.get('/admin/resources/categories', { params: { limit: 200 } }),
  brands: () => apiClient.get('/admin/resources/brands', { params: { limit: 200 } }),
  variants: () => apiClient.get('/admin/resources/product-variants', { params: { limit: 200 } }),
  inventory: () => apiClient.get('/admin/resources/inventory', { params: { limit: 200 } }),
  create: (payload) => apiClient.post('/admin/resources/products', payload),
  update: (productId, payload) => apiClient.put(`/admin/resources/products/${productId}`, payload),
  remove: (productId) => apiClient.delete(`/admin/resources/products/${productId}`),
  createVariant: (payload) => apiClient.post('/admin/resources/product-variants', payload),
  updateVariant: (variantId, payload) => apiClient.put(`/admin/resources/product-variants/${variantId}`, payload),
  createInventory: (payload) => apiClient.post('/admin/resources/inventory', payload),
  updateInventory: (variantId, payload) => apiClient.put(`/admin/resources/inventory/${variantId}`, payload),
};
