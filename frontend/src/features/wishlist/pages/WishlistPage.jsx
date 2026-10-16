import { CustomerPageHeading, CustomerQueryState, ContinueShoppingLink } from '../../../shared/components/CustomerUi.jsx';
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
      <CustomerPageHeading eyebrow="Lovely things, saved for later" title="Your favourites." description="A little collection of the pieces you love. Keep them here until the moment feels right." actions={<ContinueShoppingLink/>}/>
      <CustomerQueryState query={query}/>
      {(actions.remove.isError || actions.moveToCart.isError) && <p role="alert" className="mb-5 rounded bg-red-50 p-4 text-sm text-red-700">{(actions.moveToCart.error || actions.remove.error)?.response?.data?.error?.message || 'We could not update your wishlist. Please try again.'}</p>}
      {actions.moveToCart.isSuccess && <p role="status" className="mb-5 border border-[#ded3c3] bg-[#f3eee4] p-4 text-sm">Moved to your cart. <Link to="/cart" className="underline underline-offset-4">View your cart</Link></p>}
      {query.isSuccess && items.length === 0 && <WishlistEmptyState />}
      {items.length > 0 && <WishlistGrid items={items} actions={actions} />}
    </main>
  );
}
