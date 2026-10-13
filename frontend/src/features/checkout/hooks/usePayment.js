import { useMutation, useQuery } from '@tanstack/react-query';
import { paymentsApi } from '../api/paymentsApi.js';

export function usePaymentStatus(orderId) {
  return useQuery({
    queryKey: ['payment-status', orderId],
    enabled: Boolean(orderId),
    queryFn: async () => (await paymentsApi.status(orderId)).data.data.payment,
    refetchInterval: (query) => {
      const status = query.state.data?.order?.PaymentStatus;
      return status && !['SUCCEEDED', 'FAILED', 'CANCELLED', 'EXPIRED'].includes(status) ? 5000 : false;
    },
  });
}

export function usePaymentMutations() {
  return {
    intent: useMutation({ mutationFn: ({ orderId, payload }) => paymentsApi.createIntent(orderId, payload) }),
    verify: useMutation({ mutationFn: ({ orderId, payload }) => paymentsApi.verify(orderId, payload) }),
    retry: useMutation({ mutationFn: ({ orderId, payload }) => paymentsApi.retry(orderId, payload) }),
  };
}
