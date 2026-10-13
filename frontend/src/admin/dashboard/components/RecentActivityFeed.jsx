import { formatDate } from '../../../features/orders/utils/ordersHelpers.js';

export function RecentActivityFeed({ activity = [] }) {
  return <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm"><h2 className="text-xl font-semibold">Recent activity</h2><div className="mt-4 space-y-3">{activity.map((item) => <div key={item.AuditLogId} className="text-sm"><strong>{item.ActionName}</strong><p className="text-stone-500">{item.EntityName} {formatDate(item.CreatedAtUtc)}</p></div>)}</div></section>;
}
