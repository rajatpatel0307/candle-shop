import { Link } from 'react-router-dom';
import { WishlistEmptyState } from '../components/WishlistEmptyState.jsx';
import { WishlistGrid } from '../components/WishlistGrid.jsx';
import { useWishlist, useWishlistMutations } from '../hooks/useWishlist.js';
import { wishlistItems } from '../utils/wishlistHelpers.js';

export function WishlistPage() {
  const query = useWishlist();
  const actions = useWishlistMutations();
  const items = wishlistItems(query.data);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-[#697565]">Saved candles</p>
          <h1 className="text-4xl font-semibold">Wishlist</h1>
        </div>
        <Link className="btn-secondary" to="/shop">Continue shopping</Link>
      </div>
      {query.isLoading && <p className="text-stone-500">Loading wishlist...</p>}
      {query.isError && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{query.error?.response?.data?.error?.message || 'Could not load wishlist.'}</p>}
      {!query.isLoading && items.length === 0 && <WishlistEmptyState />}
      {items.length > 0 && <WishlistGrid items={items} actions={actions} />}
    </main>
  );
}
