import { apiClient } from '../../../services/apiClient.js';
import { endpoints } from '../../../services/endpoints.js';

export const ordersApi = {
  list: (params) => apiClient.get(endpoints.orders.root, { params }),
  detail: (orderId) => apiClient.get(endpoints.orders.detail(orderId)),
  status: (orderId) => apiClient.get(endpoints.orders.status(orderId)),
  tracking: (orderId) => apiClient.get(endpoints.orders.tracking(orderId)),
  cancel: (orderId, payload) => apiClient.post(endpoints.orders.cancel(orderId), payload),
  cancellation: (orderId) => apiClient.get(endpoints.orders.cancellation(orderId)),
  requestCancellation: (orderId, payload) => apiClient.post(endpoints.orders.cancellationRequest(orderId), payload),
};
