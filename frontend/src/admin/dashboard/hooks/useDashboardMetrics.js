import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboardApi.js';

export function useDashboardMetrics(range) {
  const params = { range };
  return {
    summary: useQuery({ queryKey: ['admin-dashboard-summary', params], queryFn: async () => (await dashboardApi.summary(params)).data.data.summary }),
    sales: useQuery({ queryKey: ['admin-dashboard-sales', params], queryFn: async () => (await dashboardApi.sales(params)).data.data.sales }),
    revenue: useQuery({ queryKey: ['admin-dashboard-revenue', params], queryFn: async () => (await dashboardApi.revenue(params)).data.data.revenue }),
    orders: useQuery({ queryKey: ['admin-dashboard-orders', params], queryFn: async () => (await dashboardApi.orders(params)).data.data.orders }),
    topProducts: useQuery({ queryKey: ['admin-dashboard-top-products', params], queryFn: async () => (await dashboardApi.topProducts(params)).data.data.products }),
    lowStock: useQuery({ queryKey: ['admin-dashboard-low-stock'], queryFn: async () => (await dashboardApi.lowStock()).data.data.items }),
    recentOrders: useQuery({ queryKey: ['admin-dashboard-recent-orders'], queryFn: async () => (await dashboardApi.recentOrders()).data.data.orders }),
    recentActivity: useQuery({ queryKey: ['admin-dashboard-recent-activity'], queryFn: async () => (await dashboardApi.recentActivity()).data.data.activity }),
  };
}
