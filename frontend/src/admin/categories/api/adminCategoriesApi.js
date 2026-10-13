import { apiClient } from '../../../services/apiClient.js';
export const adminCategoriesApi = { list: (params) => apiClient.get('/admin/resources/categories', { params }) };
