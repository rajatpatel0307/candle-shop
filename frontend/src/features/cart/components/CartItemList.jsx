import { CartItem } from './CartItem.jsx';

export function CartItemList({ items, actions }) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white px-5 shadow-sm">
      {items.map((item) => <CartItem key={item.CartItemId} item={item} actions={actions} />)}
    </section>
  );
}
