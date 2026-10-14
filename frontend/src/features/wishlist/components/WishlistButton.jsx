import { Heart } from 'lucide-react';
import { useWishlistMutations } from '../hooks/useWishlist.js';

export function WishlistButton({ productId, productVariantId, compact = false }) {
  const actions = useWishlistMutations();
  const errorMessage = actions.add.error?.response?.data?.error?.message || actions.add.error?.message;

  return (
    <div className={compact ? '' : 'grid gap-2'}>
      <button
        className={compact ? 'icon-btn' : 'btn-secondary'}
        disabled={actions.add.isPending || !productId}
        onClick={() => actions.add.mutate({
          productId,
          ...(productVariantId ? { productVariantId } : {}),
        })}
        type="button"
        aria-label="Add to wishlist"
        title={compact ? (errorMessage || (actions.add.isSuccess ? 'Saved to wishlist' : 'Add to wishlist')) : undefined}
      >
        <Heart className="h-4 w-4" />
        {!compact && (actions.add.isPending ? 'Saving...' : actions.add.isSuccess ? 'Saved' : 'Wishlist')}
      </button>
      {!compact && errorMessage && <p className="text-sm text-red-700">{errorMessage}</p>}
    </div>
  );
}
