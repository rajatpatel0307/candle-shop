import { Check } from 'lucide-react';

export function CheckoutStepPanel({ number, title, active, complete, summary, onChange, disabled, children }) {
  return (
    <section className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm" aria-labelledby={`checkout-step-${number}`}>
      <div className={`flex items-center gap-3 px-5 py-4 ${active ? 'bg-[#44362d] text-white' : 'bg-white text-stone-500'}`}>
        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-bold ${active ? 'bg-white text-[#44362d]' : 'bg-stone-100 text-stone-600'}`}>{number}</span>
        <div className="min-w-0 flex-1">
          <h2 id={`checkout-step-${number}`} className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">{title}{complete && <Check className="h-4 w-4 text-green-600" />}</h2>
          {!active && summary && <p className="mt-2 text-sm font-normal normal-case text-stone-700">{summary}</p>}
        </div>
        {!active && onChange && <button type="button" disabled={disabled} onClick={onChange} className="rounded border border-stone-300 px-4 py-2 text-xs font-bold text-[#8d5132] disabled:opacity-50">CHANGE</button>}
      </div>
      {active && <div className="grid gap-5 p-5 sm:p-6">{children}</div>}
    </section>
  );
}
