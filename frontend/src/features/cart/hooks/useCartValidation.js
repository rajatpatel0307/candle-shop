import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { cartApi } from '../api/cartApi.js';
import { useAuth } from '../../auth/hooks/useAuth.js';
import { setCartSummary } from '../store/cartSlice.js';

export function useCartValidation() {
  const client = useQueryClient();
  const dispatch = useDispatch();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async () => (await cartApi.validate()).data.data.validation,
    onSuccess: async (validation) => {
      const summary = {
        distinctItems: validation.items.length,
        totalQuantity: validation.items.reduce((sum, item) => sum + Number(item.Quantity), 0),
        subtotal: Number(validation.subtotal),
        unavailableItemCount: validation.unavailableItems.length,
        isValid: validation.isValid,
      };
      const queryKey = ['cart', user?.id];
      await client.cancelQueries({ queryKey });
      client.setQueryData(queryKey, {
        cartId: validation.cartId, items: validation.items, summary, validation,
        validationCheckedAt: Date.now(),
      });
      dispatch(setCartSummary(summary));
    },
  });
}
