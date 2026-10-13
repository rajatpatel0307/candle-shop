import { apiClient } from '../../../services/apiClient.js';
export const adminFragrancesApi = { list: (params) => apiClient.get('/admin/resources/fragrances', { params }) };
