const tones = {
  Active: 'border-green-200 bg-green-50 text-green-700',
  Draft: 'border-amber-200 bg-amber-50 text-amber-700',
  Archived: 'border-stone-200 bg-stone-100 text-stone-600',
  Inactive: 'border-red-200 bg-red-50 text-red-700',
};

export function ProductStatusControl({ status }) {
  return <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${tones[status] || tones.Draft}`}>{status || 'Draft'}</span>;
}
