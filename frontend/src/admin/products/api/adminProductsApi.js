import { apiClient } from '../../../services/apiClient.js';
export const adminProductsApi = { list: (params) => apiClient.get('/admin/resources/products', { params }) };
