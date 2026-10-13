export function OrderStatusBadge({ status }) {
  const color = status === 'DELIVERED' || status === 'SUCCEEDED' ? 'bg-green-50 text-green-700 border-green-200' : status === 'CANCELLED' || status === 'FAILED' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-800 border-amber-200';
  return <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${color}`}>{status || 'PENDING'}</span>;
}
