import { Link } from 'react-router-dom';
import { CartEmptyState } from '../components/CartEmptyState.jsx';
import { CartItemList } from '../components/CartItemList.jsx';
import { CartPriceBreakdown } from '../components/CartPriceBreakdown.jsx';
import { CartSummary } from '../components/CartSummary.jsx';
import { CartValidationMessages } from '../components/CartValidationMessages.jsx';
import { useCart, useCartMutations } from '../hooks/useCart.js';
import { useCartValidation } from '../hooks/useCartValidation.js';
import { cartItems, cartSummary } from '../utils/cartHelpers.js';

export function CartPage() {
  const query = useCart();
  const actions = useCartMutations();
  const validation = useCartValidation();
  const items = cartItems(query.data);
  const summary = cartSummary(query.data);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-[#697565]">Checkout prep</p>
          <h1 className="text-4xl font-semibold">Cart</h1>
        </div>
        <Link className="btn-secondary" to="/shop">Continue shopping</Link>
      </div>
      {query.isLoading && <p className="text-stone-500">Loading cart...</p>}
      {query.isError && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{query.error?.response?.data?.error?.message || 'Could not load cart.'}</p>}
      {!query.isLoading && items.length === 0 && <CartEmptyState />}
      {items.length > 0 && (
        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
          <div className="grid gap-5">
            <CartValidationMessages validation={validation.data || query.data?.validation} />
            <CartItemList items={items} actions={actions} />
          </div>
          <div className="grid h-fit gap-5">
            <CartSummary
              summary={summary}
              validation={validation.data || query.data?.validation}
              onValidate={() => validation.mutate()}
              onClear={() => actions.clear.mutate()}
            />
            <CartPriceBreakdown summary={summary} />
          </div>
        </div>
      )}
    </main>
  );
}
