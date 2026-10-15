import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { cartApi } from '../api/cartApi.js';
import { setCartSummary } from '../store/cartSlice.js';
import { useAuth } from '../../auth/hooks/useAuth.js';

function extractCart(response) {
  return response.data.data.cart;
}

export function useCart({ enabled = true } = {}) {
  const dispatch = useDispatch();
  const { user } = useAuth();
  return useQuery({
    queryKey: ['cart', user?.id],
    enabled: enabled && Boolean(user),
    queryFn: async () => {
      const cart = extractCart(await cartApi.get());
      dispatch(setCartSummary(cart.summary));
      return cart;
    },
  });
}

export function useCartMutations() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const handleCart = (response) => {
    const cart = extractCart(response);
    dispatch(setCartSummary(cart.summary));
    queryClient.setQueryData(['cart', user?.id], cart);
    queryClient.invalidateQueries({ queryKey: ['cart'] });
    return cart;
  };
  const refreshAvailability = (error) => {
    if (error?.response?.data?.error?.code === 'INSUFFICIENT_STOCK') {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
    }
  };

  return {
    add: useMutation({ mutationFn: cartApi.addItem, onSuccess: handleCart, onError: refreshAvailability }),
    update: useMutation({ mutationFn: ({ itemId, quantity }) => cartApi.updateItem(itemId, { quantity }), onSuccess: handleCart, onError: refreshAvailability }),
    remove: useMutation({ mutationFn: cartApi.removeItem, onSuccess: handleCart }),
    clear: useMutation({ mutationFn: cartApi.clear, onSuccess: handleCart }),
    validate: useMutation({ mutationFn: cartApi.validate }),
  };
}
