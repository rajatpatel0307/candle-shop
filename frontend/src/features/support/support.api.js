import { apiClient } from '../../services/apiClient.js';
export const supportApi = {
  create: (payload) => apiClient.post('/support/tickets', payload),
  list: () => apiClient.get('/support/tickets'),
  detail: (id) => apiClient.get(`/support/tickets/${id}`),
  reply: (id, payload) => apiClient.post(`/support/tickets/${id}/messages`, payload),
  status: (id, payload) => apiClient.patch(`/support/tickets/${id}/status`, payload),
};
