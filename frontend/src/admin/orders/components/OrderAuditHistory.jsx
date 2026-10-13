import { formatDate } from '../../../features/orders/utils/ordersHelpers.js';

export function OrderAuditHistory({ history = [] }) {
  return <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm"><h2 className="text-xl font-semibold">Audit</h2>{history.map((item) => <p key={item.OrderStatusHistoryId} className="mt-2 text-sm"><strong>{item.NewStatus}</strong> {formatDate(item.ChangedAtUtc)} {item.Notes}</p>)}</section>;
}
