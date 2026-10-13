import { useQuery } from '@tanstack/react-query';
import { checkoutApi } from '../api/checkoutApi.js';

export function useCheckoutPricing(sessionId) {
  return useQuery({
    queryKey: ['checkout-summary', sessionId],
    enabled: Boolean(sessionId),
    queryFn: async () => (await checkoutApi.summary(sessionId)).data.data.summary,
  });
}
