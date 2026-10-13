import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { checkoutApi } from '../api/checkoutApi.js';
import { setCheckoutOrder, setCheckoutSession } from '../store/checkoutSlice.js';

function extract(response) {
  return response.data.data.checkout;
}

export function useCheckout(sessionId) {
  return useQuery({
    queryKey: ['checkout', sessionId],
    enabled: Boolean(sessionId),
    queryFn: async () => extract(await checkoutApi.getSession(sessionId)),
  });
}

export function useCheckoutState() {
  return useSelector((state) => state.checkout);
}

export function useCheckoutMutations() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const refresh = (checkout) => {
    dispatch(setCheckoutSession(checkout.session.CheckoutSessionId));
    queryClient.setQueryData(['checkout', checkout.session.CheckoutSessionId], checkout);
    queryClient.invalidateQueries({ queryKey: ['checkout'] });
    queryClient.invalidateQueries({ queryKey: ['checkout-summary'] });
    return checkout;
  };

  return {
    create: useMutation({
      mutationFn: checkoutApi.createSession,
      onSuccess: (response) => refresh(extract(response)),
    }),
    addresses: useMutation({
      mutationFn: ({ sessionId, payload }) => checkoutApi.updateAddresses(sessionId, payload),
      onSuccess: (response) => refresh(extract(response)),
    }),
    shipping: useMutation({
      mutationFn: ({ sessionId, payload }) => checkoutApi.updateShippingMethod(sessionId, payload),
      onSuccess: (response) => refresh(extract(response)),
    }),
    applyDiscount: useMutation({
      mutationFn: ({ sessionId, payload }) => checkoutApi.applyDiscount(sessionId, payload),
      onSuccess: (response) => refresh(extract(response)),
    }),
    removeDiscount: useMutation({
      mutationFn: (sessionId) => checkoutApi.removeDiscount(sessionId),
      onSuccess: (response) => refresh(extract(response)),
    }),
    validate: useMutation({ mutationFn: (sessionId) => checkoutApi.validate(sessionId) }),
    submit: useMutation({
      mutationFn: ({ sessionId, payload }) => checkoutApi.submit(sessionId, payload),
      onSuccess: (response) => dispatch(setCheckoutOrder(response.data.data.result.order.OrderId)),
    }),
  };
}
