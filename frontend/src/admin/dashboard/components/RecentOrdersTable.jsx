import { Link } from 'react-router-dom';
import { currency, formatDate } from '../../../features/orders/utils/ordersHelpers.js';

export function RecentOrdersTable({ orders = [] }) {
  return <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm"><h2 className="text-xl font-semibold">Recent orders</h2><div className="mt-4 space-y-3">{orders.map((order) => <div key={order.OrderId} className="flex justify-between gap-3 text-sm"><Link className="font-semibold text-[#8d5132]" to={`/admin/orders/${order.OrderId}`}>{order.OrderNumber}</Link><span>{currency(order.GrandTotal, order.CurrencyCode)}</span><span className="text-stone-500">{formatDate(order.CreatedAtUtc)}</span></div>)}</div></section>;
}
