import { OrderCard } from './OrderCard.jsx';
import { Link } from 'react-router-dom';

export function OrderList({ orders = [] }) {
  if (!orders.length) return <section className="rounded-lg border border-stone-200 bg-white p-10 text-center shadow-sm"><h2 className="text-xl font-semibold">No orders found</h2><p className="mt-2 text-sm text-stone-500">Your orders will appear here. Try another filter or discover your next candle.</p><Link to="/shop" className="btn-primary mt-5">Explore the shop</Link></section>;
  return <div className="grid gap-4">{orders.map((order) => <OrderCard key={order.OrderId} order={order} />)}</div>;
}
