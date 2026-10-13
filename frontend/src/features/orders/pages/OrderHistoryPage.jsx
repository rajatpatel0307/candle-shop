import { Link } from 'react-router-dom';
import { OrderList } from '../components/OrderList.jsx';
import { useOrders } from '../hooks/useOrders.js';
import { orderError } from '../utils/ordersHelpers.js';

export function OrderHistoryPage() {
  const query = useOrders();
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div><p className="text-sm font-semibold uppercase text-[#697565]">Account</p><h1 className="text-4xl font-semibold">Orders</h1></div>
        <Link className="btn-secondary" to="/shop">Shop</Link>
      </div>
      {query.isLoading && <p>Loading orders...</p>}
      {query.isError && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{orderError(query.error)}</p>}
      {query.data && <OrderList orders={query.data.items} />}
    </main>
  );
}
