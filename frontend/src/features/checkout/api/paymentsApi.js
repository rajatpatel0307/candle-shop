import { apiClient } from '../../../services/apiClient.js';
import { endpoints } from '../../../services/endpoints.js';

export const paymentsApi = {
  createIntent: (orderId, payload = {}) => apiClient.post(endpoints.payments.intent(orderId), payload),
  status: (orderId) => apiClient.get(endpoints.payments.status(orderId)),
  verify: (orderId, payload) => apiClient.post(endpoints.payments.verify(orderId), payload),
  retry: (orderId, payload = {}) => apiClient.post(endpoints.payments.retry(orderId), payload),
};
