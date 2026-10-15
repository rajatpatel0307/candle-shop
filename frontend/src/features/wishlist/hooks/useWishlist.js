import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { wishlistApi } from '../api/wishlistApi.js';
import { setWishlistSummary } from '../store/wishlistSlice.js';
import { setCartSummary } from '../../cart/store/cartSlice.js';
import { useAuth } from '../../auth/hooks/useAuth.js';

function extractWishlist(response) {
  return response.data.data.wishlist;
}

export function useWishlist() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  return useQuery({
    queryKey: ['wishlist', user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const wishlist = extractWishlist(await wishlistApi.get());
      dispatch(setWishlistSummary(wishlist.summary));
      return wishlist;
    },
  });
}

export function useWishlistMutations() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const handleWishlist = (response) => {
    const wishlist = extractWishlist(response);
    dispatch(setWishlistSummary(wishlist.summary));
    queryClient.setQueryData(['wishlist', user?.id], wishlist);
    queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    queryClient.invalidateQueries({ queryKey: ['cart'] });
    return wishlist;
  };

  return {
    add: useMutation({ mutationFn: wishlistApi.addItem, onSuccess: handleWishlist }),
    remove: useMutation({ mutationFn: wishlistApi.removeItem, onSuccess: handleWishlist }),
    removeByProduct: useMutation({ mutationFn: wishlistApi.removeByProduct, onSuccess: handleWishlist }),
    moveToCart: useMutation({
      mutationFn: wishlistApi.moveToCart,
      onSuccess: (response) => {
        const wishlist = response.data.data.wishlist;
        dispatch(setWishlistSummary(wishlist.summary));
        queryClient.setQueryData(['wishlist', user?.id], wishlist);
        const cart = response.data.data.cart;
        dispatch(setCartSummary(cart.summary));
        queryClient.setQueryData(['cart', user?.id], cart);
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      },
    }),
  };
}
