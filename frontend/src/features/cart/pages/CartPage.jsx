import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, ShoppingBag, ShieldCheck, MapPin, CreditCard, HelpCircle } from 'lucide-react';
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
  const busy = actions.update.isPending || actions.remove.isPending || actions.clear.isPending;
  const cartActions = { ...actions, isValidating: validation.isPending };
  return (
    <main className="customer-cart mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10">
      <nav aria-label="Breadcrumb" className="mb-7 flex items-center gap-2 text-xs text-stone-400"><Link to="/" className="hover:text-[#8d5132]">Home</Link><ChevronRight className="h-3 w-3" /><span aria-current="page" className="text-stone-600">Shopping cart</span></nav>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div><p className="account-eyebrow">A little warmth, on its way</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Your cart<span className="ml-3 align-middle text-lg font-normal text-stone-400">{query.isSuccess ? `(${summary.totalQuantity})` : ''}</span></h1><p className="mt-3 text-sm text-stone-500">Your next favourite scent is just a few steps away.</p></div>
        <Link className="inline-flex items-center gap-2 text-xs font-semibold text-[#8d5132]" to="/shop"><ArrowLeft className="h-4 w-4" />Continue shopping</Link>
      </div>
      <ol className="mb-8 flex max-w-xl items-center" aria-label="Checkout progress">
        {[[ShoppingBag, 'Your cart'], [MapPin, 'Delivery'], [CreditCard, 'Payment']].map(([Icon,label], index) => <li key={label} aria-current={index === 0 ? 'step' : undefined} className={`flex items-center gap-2 text-xs ${index === 0 ? 'font-semibold text-[#8d5132]' : 'text-stone-400'} ${index < 2 ? 'flex-1' : ''}`}><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${index === 0 ? 'bg-[#eddfcd]' : 'border border-stone-200 bg-white/40'}`}><Icon className="h-3.5 w-3.5" /></span><span>{label}</span>{index < 2 && <span className="mx-3 hidden h-px flex-1 bg-stone-200 sm:mx-5 sm:block" />}</li>)}
      </ol>
      {query.isLoading && <div aria-label="Loading cart" className="grid gap-6 lg:grid-cols-[1fr_350px]"><div className="h-64 rounded-2xl border border-stone-200 bg-white motion-safe:animate-pulse" /><div className="h-80 rounded-2xl border border-stone-200 bg-white motion-safe:animate-pulse" /></div>}
      {query.isError && <p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{query.error?.response?.data?.error?.message || 'Could not load cart.'}<button type="button" className="ml-3 underline" onClick={() => query.refetch()}>Try again</button></p>}
      {query.isSuccess && items.length === 0 && <CartEmptyState />}
      {items.length > 0 && <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_350px] lg:gap-8">
        <div className="min-w-0 space-y-5">
          <CartValidationMessages validation={query.data?.validation} />
          <CartItemList items={items} actions={cartActions} onClear={() => actions.clear.mutate()} busy={busy || validation.isPending} />
          {actions.remove.isError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{actions.remove.error?.response?.data?.error?.message || 'Could not remove the item. Please try again.'}</p>}
          {actions.clear.isError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{actions.clear.error?.response?.data?.error?.message || 'Could not clear your cart. Please try again.'}</p>}
          <CartPriceBreakdown />
        </div>
        <aside className="grid gap-5 lg:sticky lg:top-24">
          <CartSummary summary={summary} validation={query.data?.validation} isValidating={validation.isPending} validationChecked={Boolean(query.data?.validationCheckedAt)} validationError={validation.error} busy={busy} onValidate={() => validation.mutate()} />
          <div className="flex items-start gap-3 px-2 text-xs leading-5 text-stone-400"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#9d927f]" /><p>Your order is checked for current stock and pricing before checkout.</p></div>
          <Link to="/contact" className="flex items-center justify-center gap-2 text-xs text-stone-500 hover:text-[#8d5132]"><HelpCircle className="h-3.5 w-3.5" />Need a hand with your order?</Link>
        </aside>
      </div>}
    </main>
  );
}
