import { Heart } from 'lucide-react';
import { useWishlistMutations } from '../hooks/useWishlist.js';

export function WishlistButton({ productId, productVariantId, compact = false }) {
  const actions = useWishlistMutations();
  return (
    <button
      className={compact ? 'icon-btn' : 'btn-secondary'}
      disabled={actions.add.isPending || !productId}
      onClick={() => actions.add.mutate({ productId, productVariantId })}
      type="button"
      aria-label="Add to wishlist"
    >
      <Heart className="h-4 w-4" /> {!compact && 'Wishlist'}
    </button>
  );
}
