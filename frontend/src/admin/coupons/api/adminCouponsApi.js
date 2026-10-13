import { apiClient } from '../../../services/apiClient.js';
export const adminCouponsApi = { list: () => apiClient.get('/admin/resources/coupons'), create: (payload) => apiClient.post('/admin/resources/coupons', payload), update: (id, payload) => apiClient.put(`/admin/resources/coupons/${id}`, payload) };
