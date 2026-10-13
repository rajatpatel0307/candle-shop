import { apiClient } from '../../../services/apiClient.js';

const root = '/admin/content';

export const adminContentApi = {
  banners: {
    list: (params) => apiClient.get(`${root}/banners`, { params }),
    create: (payload) => apiClient.post(`${root}/banners`, payload),
    update: (id, payload) => apiClient.patch(`${root}/banners/${id}`, payload),
    remove: (id) => apiClient.delete(`${root}/banners/${id}`),
  },
  promotions: {
    list: (params) => apiClient.get(`${root}/promotions`, { params }),
    create: (payload) => apiClient.post(`${root}/promotions`, payload),
    update: (id, payload) => apiClient.patch(`${root}/promotions/${id}`, payload),
    remove: (id) => apiClient.delete(`${root}/promotions/${id}`),
  },
  pages: {
    list: (params) => apiClient.get(`${root}/pages`, { params }),
    create: (payload) => apiClient.post(`${root}/pages`, payload),
    detail: (id) => apiClient.get(`${root}/pages/${id}`),
    update: (id, payload) => apiClient.patch(`${root}/pages/${id}`, payload),
    publish: (id) => apiClient.patch(`${root}/pages/${id}/publish`),
    archive: (id) => apiClient.patch(`${root}/pages/${id}/archive`),
    revisions: (id) => apiClient.get(`${root}/pages/${id}/revisions`),
  },
  seo: {
    list: (params) => apiClient.get(`${root}/seo`, { params }),
    create: (payload) => apiClient.post(`${root}/seo`, payload),
    update: (id, payload) => apiClient.patch(`${root}/seo/${id}`, payload),
    remove: (id) => apiClient.delete(`${root}/seo/${id}`),
  },
  featured: {
    list: (params) => apiClient.get(`${root}/featured-products`, { params }),
    create: (payload) => apiClient.post(`${root}/featured-products`, payload),
    update: (id, payload) => apiClient.patch(`${root}/featured-products/${id}`, payload),
    remove: (id) => apiClient.delete(`${root}/featured-products/${id}`),
  },
};
