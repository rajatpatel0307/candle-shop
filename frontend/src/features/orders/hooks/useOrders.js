import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../api/ordersApi.js';

export function useOrders(params = {}) {
  return useQuery({
    queryKey: ['orders', params],
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
