import { Check } from 'lucide-react';

export function CheckoutStepPanel({ number, title, active, complete, summary, onChange, disabled, children }) {
  return (
    <section className="checkout-step overflow-hidden rounded-lg border border-stone-200 bg-white" aria-labelledby={`checkout-step-${number}`}>
      <div className={`flex items-center gap-3 px-5 py-4 ${active ? 'checkout-step-active bg-[#f0e9dd] text-[#514334]' : 'bg-white text-stone-500'}`}>
        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-bold ${active ? 'bg-white text-[#44362d]' : 'bg-stone-100 text-stone-600'}`}>{number}</span>
        <div className="min-w-0 flex-1">
          <h2 id={`checkout-step-${number}`} className="checkout-step-title flex items-center gap-2 text-sm font-medium">{title}{complete && <Check className="h-4 w-4 text-green-600" />}</h2>
          {!active && summary && <p className="mt-2 text-sm font-normal normal-case text-stone-700">{summary}</p>}
        </div>
        {!active && onChange && <button type="button" disabled={disabled} onClick={onChange} className="rounded border border-stone-300 px-4 py-2 text-xs font-bold text-[#8d5132] disabled:opacity-50">Change</button>}
      </div>
      {active && <div className="grid gap-5 p-5 sm:p-6">{children}</div>}
    </section>
  );
}
