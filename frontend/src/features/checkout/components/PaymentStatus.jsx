import { Link } from 'react-router-dom';
import { currency } from '../utils/checkoutHelpers.js';

export function PaymentStatus({ status }) {
  const order = status?.order;
  const payment = status?.payment;
  if (!order) return null;
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold">Payment status</h2>
      <dl className="mt-4 grid gap-2 text-sm">
        <div className="flex justify-between"><dt>Order</dt><dd>{order.OrderNumber}</dd></div>
        <div className="flex justify-between"><dt>Amount</dt><dd>{currency(order.GrandTotal, order.CurrencyCode)}</dd></div>
        <div className="flex justify-between"><dt>Order status</dt><dd>{order.OrderStatus}</dd></div>
        <div className="flex justify-between"><dt>Payment status</dt><dd>{payment?.PaymentStatus || order.PaymentStatus}</dd></div>
      </dl>
      {order.PaymentStatus === 'SUCCEEDED' && <Link className="btn-primary mt-5" to={`/orders/${order.OrderId}/confirmation`}>View confirmation</Link>}
    </section>
  );
}
