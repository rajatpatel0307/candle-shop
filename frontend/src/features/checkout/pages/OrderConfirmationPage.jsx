import { Link, useParams } from 'react-router-dom';
import { CheckoutLoading } from '../components/CheckoutLoading.jsx';
import { PaymentStatus } from '../components/PaymentStatus.jsx';
import { usePaymentStatus } from '../hooks/usePayment.js';

export function OrderConfirmationPage() {
  const { orderId } = useParams();
  const query = usePaymentStatus(orderId);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-4xl font-semibold">Order confirmation</h1>
      {query.isLoading && <CheckoutLoading label="Loading order..." />}
      {query.data?.order?.PaymentStatus !== 'SUCCEEDED' && <p className="mt-5 rounded-md bg-amber-50 p-3 text-sm text-amber-800">Payment is not confirmed yet. This page updates after the backend verifies payment.</p>}
      <div className="mt-6"><PaymentStatus status={query.data} /></div>
      <Link className="btn-primary mt-5" to="/shop">Shop more candles</Link>
    </main>
  );
}
