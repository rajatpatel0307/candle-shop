import { useMutation } from '@tanstack/react-query';
import { cartApi } from '../api/cartApi.js';

export function useCartValidation() {
  return useMutation({
    mutationFn: async () => (await cartApi.validate()).data.data.validation,
  });
}
