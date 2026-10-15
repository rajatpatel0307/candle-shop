import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, CheckCircle2, RefreshCw, LockKeyhole, AlertCircle } from 'lucide-react';
import { currency } from '../utils/cartHelpers.js';

export function CartSummary({ summary, validation, onValidate, isValidating = false, validationChecked = false, validationError, busy = false }) {
  const blocked = summary?.isValid === false || validation?.isValid === false;
  const checkoutDisabled = blocked || isValidating || busy;
  const count = summary?.totalQuantity || 0;
  return (
    <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm" aria-labelledby="cart-summary-title">
      <div className="border-b border-stone-100 p-6"><p className="account-eyebrow">Almost yours</p><h2 id="cart-summary-title" className="mt-2 text-xl font-semibold">Order summary</h2></div>
      <div className="p-6">
        <dl className="space-y-4 text-sm"><div className="flex items-center justify-between gap-3"><dt className="text-stone-500">Subtotal <span className="text-xs text-stone-400">({count} {count === 1 ? 'item' : 'items'})</span></dt><dd className="font-semibold">{currency(summary?.subtotal || 0)}</dd></div><div className="flex items-center justify-between gap-3"><dt className="text-stone-500">Delivery</dt><dd className="text-xs text-stone-400">Calculated at checkout</dd></div></dl>
        <div className="mt-5 flex items-end justify-between gap-3 border-t border-dashed border-stone-200 pt-5"><div><p className="text-sm font-semibold">Cart total</p><p className="mt-1 text-[10px] text-stone-400">Before delivery and applicable taxes</p></div><p className="text-2xl font-semibold tracking-tight">{currency(summary?.subtotal || 0)}</p></div>
        {validationChecked && !blocked && !isValidating && <p role="status" className="mt-5 flex items-start gap-2 rounded-xl bg-green-50 p-3 text-xs leading-5 text-green-700"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />Your cart is ready for checkout. Stock and prices are up to date.</p>}
        {validationError && !isValidating && <p role="alert" className="mt-5 flex gap-2 rounded-xl bg-red-50 p-3 text-xs leading-5 text-red-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{validationError?.response?.data?.error?.message || 'Could not validate your cart. Please try again.'}</p>}
        {blocked && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-xs leading-5 text-red-700">Resolve cart validation messages before checkout.</p>}
        <div className="mt-6 grid gap-3"><Link className={`btn-primary w-full rounded-xl py-4 ${checkoutDisabled ? 'pointer-events-none opacity-60' : ''}`} aria-disabled={checkoutDisabled} tabIndex={checkoutDisabled ? -1 : undefined} onClick={(event) => { if (checkoutDisabled) event.preventDefault(); }} to="/checkout">Proceed to checkout<ArrowRight className="ml-2 h-4 w-4" /></Link><button type="button" className="flex w-full items-center justify-center gap-2 rounded-lg border border-stone-200 px-4 py-3 text-xs font-medium text-stone-500 transition hover:border-[#c8ac8d] hover:text-[#8d5132] disabled:opacity-50" disabled={isValidating || busy} aria-busy={isValidating} onClick={onValidate}>{isValidating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}{isValidating ? 'Checking cart...' : 'Validate cart'}</button></div>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-stone-400"><LockKeyhole className="h-3 w-3" />Your checkout is secure</p>
      </div>
    </section>
  );
}
