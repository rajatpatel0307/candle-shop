import { formatDate } from '../utils/ordersHelpers.js';

export function OrderTimeline({ history = [] }) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold">Timeline</h2>
      <ol className="mt-4 space-y-3 text-sm">
        {history.map((item) => <li key={item.OrderStatusHistoryId} className="border-l-2 border-[#b56b45] pl-3"><strong>{item.NewStatus}</strong><p className="text-stone-500">{formatDate(item.ChangedAtUtc)} {item.Notes}</p></li>)}
      </ol>
    </section>
  );
}
