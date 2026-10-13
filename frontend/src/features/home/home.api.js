import { apiClient } from '../../services/apiClient.js';

export const homeApi = {
  getHome: () => apiClient.get('/content/home'),
  banners: () => apiClient.get('/content/banners'),
  promotions: () => apiClient.get('/content/promotions'),
  featuredProducts: (sectionKey = 'home-featured') => apiClient.get('/content/featured-products', { params: { sectionKey } }),
};
