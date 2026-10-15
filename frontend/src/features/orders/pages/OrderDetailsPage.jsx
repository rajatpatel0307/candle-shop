import { Link, useParams } from 'react-router-dom';
import { OrderDetails } from '../components/OrderDetails.jsx';
import { useOrderDetails } from '../hooks/useOrderDetails.js';
import { useOrderActions } from '../hooks/useOrders.js';
import { orderError } from '../utils/ordersHelpers.js';
import { OrderStatusBadge } from '../components/OrderStatusBadge.jsx';

export function OrderDetailsPage() {
  const { orderId } = useParams();
  const query = useOrderDetails(orderId);
  const actions = useOrderActions(orderId);
  return (
    <main>
      <Link className="text-sm font-semibold text-[#8d5132]" to="/orders">Back to orders</Link>
      <h1 className="mt-3 break-words text-2xl font-semibold">{query.data?.order?.OrderNumber || 'Order details'}</h1>
      {query.data && <div className="mt-4 flex flex-wrap items-center gap-3"><OrderStatusBadge status={query.data.order.OrderStatus} /><span className="text-sm text-stone-500">{query.data.order.PaymentMethod === 'COD' && query.data.order.PaymentStatus !== 'SUCCEEDED' ? 'Cash on delivery' : `Payment: ${query.data.order.PaymentStatus}`}</span></div>}
      {(query.isError || actions.cancel.isError) && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{orderError(query.error || actions.cancel.error)}</p>}
      {query.isLoading && <p className="mt-5">Loading order...</p>}
      {actions.cancel.isSuccess && <p role="status" className="mt-5 rounded-md bg-green-50 p-3 text-sm text-green-700">{actions.cancel.data?.data?.data?.cancellation?.requiresReview ? 'Your cancellation request has been sent for review.' : 'Your order has been cancelled.'}</p>}
      {query.data && <div className="mt-6"><OrderDetails details={query.data} actions={actions} /></div>}
    </main>
  );
}
