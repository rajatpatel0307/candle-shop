import { AdminTableHeading } from '../../shared/AdminListOverview.jsx';
import { Link } from 'react-router-dom';
import { currency, formatDate } from '../../../features/orders/utils/ordersHelpers.js';
import { OrderStatusBadge } from '../../../features/orders/components/OrderStatusBadge.jsx';

export function AdminOrdersTable({ orders = [] }) {
  return (
    <section className="overflow-x-auto rounded-lg border border-stone-200 bg-white shadow-sm">
      <AdminTableHeading title="Customer orders" count={orders.length}/>
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="bg-stone-100 text-xs uppercase text-stone-600"><tr><th className="px-4 py-3">Order</th><th>Customer</th><th>Status</th><th>Payment</th><th>Total</th><th>Created</th><th>Actions</th></tr></thead>
        <tbody>
          {orders.length === 0 && <tr><td colSpan={7} className="px-5 py-12 text-center text-stone-500">No orders found. Confirmed orders will appear here.</td></tr>}
          {orders.map((order) => (
            <tr key={order.OrderId} className="border-t border-stone-100">
              <td className="px-4 py-3 font-semibold">{order.OrderNumber}</td>
              <td>{order.Email || [order.FirstName, order.LastName].filter(Boolean).join(' ')}</td>
              <td><OrderStatusBadge status={order.OrderStatus} /></td>
              <td><OrderStatusBadge status={order.PaymentStatus} /></td>
              <td>{currency(order.GrandTotal, order.CurrencyCode)}</td>
              <td>{formatDate(order.CreatedAtUtc)}</td>
              <td><Link className="text-[#8d5132] underline" to={`/admin/orders/${order.OrderId}`}>Open</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
