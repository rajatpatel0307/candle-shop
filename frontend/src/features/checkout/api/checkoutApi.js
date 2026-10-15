import { apiClient } from '../../../services/apiClient.js';
import { endpoints } from '../../../services/endpoints.js';

export const checkoutApi = {
  createAddress: (payload) => apiClient.post('/checkout/addresses', payload),
  createSession: (payload = {}) => apiClient.post(endpoints.checkout.session, payload),
  getSession: (id) => apiClient.get(endpoints.checkout.byId(id)),
  updateAddresses: (id, payload) => apiClient.put(endpoints.checkout.addresses(id), payload),
  updateShippingMethod: (id, payload) => apiClient.put(endpoints.checkout.shippingMethod(id), payload),
  applyDiscount: (id, payload) => apiClient.post(endpoints.checkout.applyDiscount(id), payload),
  removeDiscount: (id) => apiClient.post(endpoints.checkout.removeDiscount(id)),
  summary: (id) => apiClient.get(endpoints.checkout.summary(id)),
  validate: (id) => apiClient.post(endpoints.checkout.validate(id)),
  submit: (id, payload) => apiClient.post(endpoints.checkout.submit(id), payload),
};
