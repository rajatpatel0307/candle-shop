import { apiClient } from '../../../services/apiClient.js';
export const adminBrandsApi = { list: (params) => apiClient.get('/admin/resources/brands', { params }) };
