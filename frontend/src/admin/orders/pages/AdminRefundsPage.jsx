import { currency, formatDate } from '../../../features/orders/utils/ordersHelpers.js';
import { useAdminRefunds } from '../hooks/useAdminOrders.js';

export function AdminRefundsPage() {
  const query = useAdminRefunds();
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-4xl font-semibold">Refunds</h1>
      <section className="mt-6 overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
        {(query.data || []).map((refund) => <div key={refund.RefundId} className="flex justify-between gap-4 border-b border-stone-100 p-4 text-sm"><span>{refund.RefundNumber} {refund.OrderNumber}</span><span>{currency(refund.RefundAmount, refund.CurrencyCode)}</span><span>{refund.RefundStatus}</span><span>{formatDate(refund.CreatedAtUtc)}</span></div>)}
      </section>
    </main>
  );
}
