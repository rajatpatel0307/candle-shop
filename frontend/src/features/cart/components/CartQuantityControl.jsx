import { Minus, Plus } from 'lucide-react';

export function CartQuantityControl({ value, max = 99, disabled, onChange }) {
  return (
    <div className="inline-flex items-center rounded-md border border-stone-300 bg-white">
      <button type="button" className="px-3 py-2 disabled:opacity-40" disabled={disabled || value <= 1} onClick={() => onChange(value - 1)} aria-label="Decrease quantity">
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-10 text-center text-sm font-semibold">{value}</span>
      <button type="button" className="px-3 py-2 disabled:opacity-40" disabled={disabled || value >= max} onClick={() => onChange(value + 1)} aria-label="Increase quantity">
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
