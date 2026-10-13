import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { wishlistApi } from '../api/wishlistApi.js';
import { setWishlistSummary } from '../store/wishlistSlice.js';

function extractWishlist(response) {
  return response.data.data.wishlist;
}

export function useWishlist() {
  const dispatch = useDispatch();
  return useQuery({
    queryKey: ['wishlist'],
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
  const handleWishlist = (response) => {
    const wishlist = extractWishlist(response);
    dispatch(setWishlistSummary(wishlist.summary));
    queryClient.setQueryData(['wishlist'], wishlist);
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
        queryClient.setQueryData(['wishlist'], wishlist);
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      },
    }),
  };
}
