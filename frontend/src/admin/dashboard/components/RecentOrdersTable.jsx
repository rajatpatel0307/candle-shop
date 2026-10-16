import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { currency, formatDate } from '../../../features/orders/utils/ordersHelpers.js';
import { OrderStatusBadge } from '../../../features/orders/components/OrderStatusBadge.jsx';
export function RecentOrdersTable({ orders = [] }) {
 return <section className="admin-widget"><div className="admin-widget-heading"><h2>Recent orders</h2><Link to="/admin/orders">View all <ArrowUpRight size={13}/></Link></div>{!orders.length ? <p className="admin-widget-empty">New orders will appear here.</p>:<div className="overflow-x-auto"><table className="w-full min-w-[510px] text-left"><thead><tr>{['Order','Placed','Status','Total'].map(label=><th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{orders.slice(0,6).map(order=><tr key={order.OrderId} className="border-b last:border-0"><td><Link className="font-medium text-[#826345]" to={`/admin/orders/${order.OrderId}`}>{order.OrderNumber}</Link></td><td className="text-stone-500">{formatDate(order.CreatedAtUtc)}</td><td><OrderStatusBadge status={order.OrderStatus}/></td><td className="whitespace-nowrap">{currency(order.GrandTotal,order.CurrencyCode)}</td></tr>)}</tbody></table></div>}</section>;
}
