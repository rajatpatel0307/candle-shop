import { useState } from 'react';

export function DiscountSection({ onApply, onRemove, code, disabled }) {
  const [draft, setDraft] = useState(code || '');
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold">Discount</h2>
      <div className="mt-4 flex gap-2">
        <input className="input" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Coupon code" />
        <button className="btn-secondary" disabled={disabled || !draft.trim()} onClick={() => onApply(draft.trim())}>Apply</button>
      </div>
      {code && <button className="mt-3 text-sm font-semibold text-[#8d5132]" disabled={disabled} onClick={onRemove}>Remove {code}</button>}
    </section>
  );
}
