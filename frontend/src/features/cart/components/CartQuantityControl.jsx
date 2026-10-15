import { Minus, Plus } from 'lucide-react';

export function CartQuantityControl({ value, max = 99, disabled, onChange }) {
  return (
    <div className="inline-flex items-center overflow-hidden rounded-lg border border-stone-200 bg-[#fcfaf7]">
      <button type="button" className="flex h-9 w-9 items-center justify-center text-stone-500 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-30" disabled={disabled || value <= 1} onClick={() => onChange(value - 1)} aria-label="Decrease quantity">
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span aria-live="polite" aria-atomic="true" className="w-8 text-center text-xs font-semibold">{value}</span>
      <button type="button" className="flex h-9 w-9 items-center justify-center text-stone-500 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-30" disabled={disabled || value >= max} onClick={() => onChange(value + 1)} aria-label="Increase quantity">
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
