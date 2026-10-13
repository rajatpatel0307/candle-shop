import { OrderCard } from './OrderCard.jsx';

export function OrderList({ orders = [] }) {
  if (!orders.length) return <section className="rounded-lg border border-stone-200 bg-white p-10 text-center shadow-sm">No orders yet.</section>;
  return <div className="grid gap-4">{orders.map((order) => <OrderCard key={order.OrderId} order={order} />)}</div>;
}
