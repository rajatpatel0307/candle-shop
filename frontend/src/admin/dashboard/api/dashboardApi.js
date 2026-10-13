import { apiClient } from '../../../services/apiClient.js';
import { endpoints } from '../../../services/endpoints.js';

export const dashboardApi = {
  summary: (params) => apiClient.get(endpoints.adminDashboard.summary, { params }),
  sales: (params) => apiClient.get(endpoints.adminDashboard.sales, { params }),
  revenue: (params) => apiClient.get(endpoints.adminDashboard.revenue, { params }),
  orders: (params) => apiClient.get(endpoints.adminDashboard.orders, { params }),
  topProducts: (params) => apiClient.get(endpoints.adminDashboard.topProducts, { params }),
  lowStock: () => apiClient.get(endpoints.adminDashboard.lowStock),
  recentOrders: () => apiClient.get(endpoints.adminDashboard.recentOrders),
  recentActivity: () => apiClient.get(endpoints.adminDashboard.recentActivity),
  overview: () => apiClient.get(endpoints.adminDashboard.overview),
};
