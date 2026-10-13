import { apiClient } from '../../../services/apiClient.js';
export const adminShippingApi = { rates: () => apiClient.get('/admin/resources/shipping-rates'), createRate: (payload) => apiClient.post('/admin/resources/shipping-rates', payload) };
