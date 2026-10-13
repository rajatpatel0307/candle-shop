import { Link, useParams } from 'react-router-dom';
import { OrderDetails } from '../components/OrderDetails.jsx';
import { useOrderDetails } from '../hooks/useOrderDetails.js';
import { useOrderActions } from '../hooks/useOrders.js';
import { orderError } from '../utils/ordersHelpers.js';

export function OrderDetailsPage() {
  const { orderId } = useParams();
  const query = useOrderDetails(orderId);
  const actions = useOrderActions(orderId);
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Link className="text-sm font-semibold text-[#8d5132]" to="/orders">Back to orders</Link>
      <h1 className="mt-3 text-4xl font-semibold">{query.data?.order?.OrderNumber || 'Order details'}</h1>
      {(query.isError || actions.cancel.isError) && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{orderError(query.error || actions.cancel.error)}</p>}
      {query.isLoading && <p className="mt-5">Loading order...</p>}
      {query.data && <div className="mt-6"><OrderDetails details={query.data} actions={actions} /></div>}
    </main>
  );
}
