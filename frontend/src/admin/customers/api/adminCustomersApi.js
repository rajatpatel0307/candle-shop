import { apiClient } from '../../../services/apiClient.js';
export const adminCustomersApi = { list: (params) => apiClient.get('/admin/resources/users', { params }), detail: (id) => apiClient.get(`/admin/resources/users/${id}`), update: (id, payload) => apiClient.put(`/admin/resources/users/${id}`, payload) };
