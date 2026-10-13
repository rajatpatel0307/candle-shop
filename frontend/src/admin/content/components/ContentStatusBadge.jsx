export function ContentStatusBadge({ status }) {
  const tone = status === 'PUBLISHED' ? 'bg-green-50 text-green-700 border-green-200' : status === 'ARCHIVED' ? 'bg-stone-100 text-stone-600 border-stone-200' : 'bg-amber-50 text-amber-700 border-amber-200';
  return <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${tone}`}>{status || 'DRAFT'}</span>;
}
