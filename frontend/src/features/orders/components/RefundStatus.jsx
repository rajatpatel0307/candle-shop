import { currency } from '../utils/ordersHelpers.js';
import { OrderStatusBadge } from './OrderStatusBadge.jsx';

export function RefundStatus({ refunds = [] }) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold">Refunds</h2>
      {refunds.length === 0 ? <p className="mt-3 text-sm text-stone-500">No refunds.</p> : refunds.map((refund) => (
        <div key={refund.RefundId} className="mt-3 flex justify-between gap-3 text-sm"><span>{refund.RefundNumber} {currency(refund.RefundAmount, refund.CurrencyCode)}</span><OrderStatusBadge status={refund.RefundStatus} /></div>
      ))}
    </section>
  );
}
