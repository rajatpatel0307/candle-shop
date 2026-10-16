import { WishlistItem } from './WishlistItem.jsx';

export function WishlistGrid({ items, actions }) {
  return (
    <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => <WishlistItem key={item.WishlistItemId} item={item} actions={actions} />)}
    </div>
  );
}
