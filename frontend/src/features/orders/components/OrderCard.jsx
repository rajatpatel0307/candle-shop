import { Link } from 'react-router-dom';
import { currency, formatDate } from '../utils/ordersHelpers.js';
import { OrderStatusBadge } from './OrderStatusBadge.jsx';

export function OrderCard({ order }) {
  return (
    <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-stone-500">{formatDate(order.CreatedAtUtc)}</p>
          <h2 className="text-xl font-semibold">{order.OrderNumber}</h2>
          <p className="mt-1 font-semibold">{currency(order.GrandTotal, order.CurrencyCode)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <OrderStatusBadge status={order.OrderStatus} />
          <OrderStatusBadge status={order.PaymentStatus} />
          {order.LatestShipmentStatus && <OrderStatusBadge status={order.LatestShipmentStatus} />}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link className="btn-secondary" to={`/orders/${order.OrderId}`}>Details</Link>
        <Link className="btn-secondary" to={`/orders/${order.OrderId}/tracking`}>Track</Link>
      </div>
    </article>
  );
}
