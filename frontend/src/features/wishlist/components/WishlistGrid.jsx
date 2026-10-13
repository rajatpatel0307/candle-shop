import { WishlistItem } from './WishlistItem.jsx';

export function WishlistGrid({ items, actions }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => <WishlistItem key={item.WishlistItemId} item={item} actions={actions} />)}
    </div>
  );
}
