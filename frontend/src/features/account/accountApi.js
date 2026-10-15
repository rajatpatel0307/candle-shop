import { apiClient } from '../../services/apiClient.js';

export const accountApi = {
  profile: () => apiClient.get('/account/profile'),
  saveProfile: (payload) => apiClient.put('/account/profile', payload),
  addresses: () => apiClient.get('/account/addresses'),
  saveAddress: ({ id, payload }) => id ? apiClient.put(`/account/addresses/${id}`, payload) : apiClient.post('/account/addresses', payload),
  deleteAddress: (id) => apiClient.delete(`/account/addresses/${id}`),
};
