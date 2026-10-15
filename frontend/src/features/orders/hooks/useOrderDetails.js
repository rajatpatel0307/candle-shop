import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../api/ordersApi.js';
import { useAuth } from '../../auth/hooks/useAuth.js';

export function useOrderDetails(orderId) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['order', orderId, user?.id],
    enabled: Boolean(orderId && user),
    queryFn: async () => (await ordersApi.detail(orderId)).data.data.order,
  });
}

export function useOrderTracking(orderId) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['order-tracking', orderId, user?.id],
    enabled: Boolean(orderId && user),
    queryFn: async () => (await ordersApi.tracking(orderId)).data.data.tracking,
  });
}
