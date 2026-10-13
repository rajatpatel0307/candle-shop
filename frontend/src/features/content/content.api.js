import { apiClient } from '../../services/apiClient.js';

export const contentApi = {
  page: (slug) => apiClient.get(`/content/pages/${slug}`),
  seo: (params) => apiClient.get('/content/seo', { params }),
};
