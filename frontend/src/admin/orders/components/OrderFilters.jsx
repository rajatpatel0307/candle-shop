export function OrderFilters({ filters, onChange }) {
  return (
    <div className="grid gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-sm md:grid-cols-3">
      <select className="input" value={filters.status || ''} onChange={(event) => onChange({ ...filters, status: event.target.value || undefined })}>
        <option value="">All order statuses</option>
        {['PENDING_PAYMENT', 'CONFIRMED', 'PROCESSING', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => <option key={status} value={status}>{status}</option>)}
      </select>
      <select className="input" value={filters.paymentStatus || ''} onChange={(event) => onChange({ ...filters, paymentStatus: event.target.value || undefined })}>
        <option value="">All payment statuses</option>
        {['PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'REFUNDED'].map((status) => <option key={status} value={status}>{status}</option>)}
      </select>
    </div>
  );
}
