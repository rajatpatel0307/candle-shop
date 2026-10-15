import { Link, useParams } from 'react-router-dom';
import { CheckoutLoading } from '../components/CheckoutLoading.jsx';
import { PaymentStatus } from '../components/PaymentStatus.jsx';
import { usePaymentStatus } from '../hooks/usePayment.js';
import { isOrderConfirmed, OrderSuccess } from '../components/OrderSuccess.jsx';

export function OrderConfirmationPage() {
  const { orderId } = useParams();
  const query = usePaymentStatus(orderId);

  if (isOrderConfirmed(query.data?.order)) return <OrderSuccess order={query.data.order} />;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-4xl font-semibold">Order confirmation</h1>
      {query.isLoading && <CheckoutLoading label="Loading order..." />}
      {query.isError && <p role="alert" className="mt-5 rounded-md bg-red-50 p-3 text-sm text-red-700">Could not load your order. <button className="underline" onClick={() => query.refetch()}>Try again</button></p>}
      {query.data?.order?.PaymentMethod === 'COD' ? <p className="mt-5 rounded-md bg-green-50 p-4 text-sm text-green-800">Your order is confirmed. Pay on delivery.</p> : query.data && query.data.order?.PaymentStatus !== 'SUCCEEDED' && <p className="mt-5 rounded-md bg-amber-50 p-3 text-sm text-amber-800">Payment is not confirmed yet. This page updates after the backend verifies payment.</p>}
      <div className="mt-6"><PaymentStatus status={query.data} /></div>
      {query.data?.order && <Link className="btn-secondary mt-5 mr-3" to={`/orders/${orderId}`}>View order details</Link>}
      <Link className="btn-primary mt-5" to="/shop">Shop more candles</Link>
    </main>
  );
}
