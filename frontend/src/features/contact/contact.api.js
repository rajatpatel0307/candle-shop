import { apiClient } from '../../services/apiClient.js';
export const contactApi = { submit: (payload) => apiClient.post('/contact', payload), mine: () => apiClient.get('/contact/my-messages') };
