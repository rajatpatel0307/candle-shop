import { apiClient } from '../../../services/apiClient.js';
import { endpoints } from '../../../services/endpoints.js';

export const adminCustomersApi = {
  list: (params) => apiClient.get(endpoints.adminCustomers.root, { params }),
  detail: (id) => apiClient.get(endpoints.adminCustomers.detail(id)),
};
