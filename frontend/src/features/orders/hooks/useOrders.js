import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../api/ordersApi.js';
import { useAuth } from '../../auth/hooks/useAuth.js';

export function useOrders(params = {}) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['orders', user?.id, params],
    enabled: Boolean(user),
    queryFn: async () => (await ordersApi.list(params)).data.data.orders,
  });
}

export function useOrderActions(orderId) {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['order', orderId] });
  };
  return {
    cancel: useMutation({ mutationFn: (payload) => ordersApi.cancel(orderId, payload), onSuccess: invalidate }),
    requestCancellation: useMutation({ mutationFn: (payload) => ordersApi.requestCancellation(orderId, payload), onSuccess: invalidate }),
  };
}
