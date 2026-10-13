import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../api/ordersApi.js';

export function useOrderDetails(orderId) {
  return useQuery({
    queryKey: ['order', orderId],
    enabled: Boolean(orderId),
    queryFn: async () => (await ordersApi.detail(orderId)).data.data.order,
  });
}

export function useOrderTracking(orderId) {
  return useQuery({
    queryKey: ['order-tracking', orderId],
    enabled: Boolean(orderId),
    queryFn: async () => (await ordersApi.tracking(orderId)).data.data.tracking,
  });
}
