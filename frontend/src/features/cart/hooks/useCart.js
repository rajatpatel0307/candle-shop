import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { cartApi } from '../api/cartApi.js';
import { setCartSummary } from '../store/cartSlice.js';

function extractCart(response) {
  return response.data.data.cart;
}

export function useCart() {
  const dispatch = useDispatch();
  return useQuery({
    queryKey: ['cart'],
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
  const handleCart = (response) => {
    const cart = extractCart(response);
    dispatch(setCartSummary(cart.summary));
    queryClient.setQueryData(['cart'], cart);
    queryClient.invalidateQueries({ queryKey: ['cart'] });
    return cart;
  };

  return {
    add: useMutation({ mutationFn: cartApi.addItem, onSuccess: handleCart }),
    update: useMutation({ mutationFn: ({ itemId, quantity }) => cartApi.updateItem(itemId, { quantity }), onSuccess: handleCart }),
    remove: useMutation({ mutationFn: cartApi.removeItem, onSuccess: handleCart }),
    clear: useMutation({ mutationFn: cartApi.clear, onSuccess: handleCart }),
    validate: useMutation({ mutationFn: cartApi.validate }),
  };
}
