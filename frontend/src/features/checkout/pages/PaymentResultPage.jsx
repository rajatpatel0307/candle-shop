import { Link, useSearchParams } from 'react-router-dom';
import { CheckoutLoading } from '../components/CheckoutLoading.jsx';
import { PaymentStatus } from '../components/PaymentStatus.jsx';
import { usePaymentStatus } from '../hooks/usePayment.js';

export function PaymentResultPage() {
  const [params] = useSearchParams();
  const orderId = params.get('orderId');
  const query = usePaymentStatus(orderId);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-4xl font-semibold">Payment result</h1>
      {!orderId && <p className="mt-5 rounded-md bg-red-50 p-3 text-sm text-red-700">Order reference is missing.</p>}
      {query.isLoading && <CheckoutLoading label="Checking payment status..." />}
      {query.isError && <p className="mt-5 rounded-md bg-red-50 p-3 text-sm text-red-700">Could not load payment status.</p>}
      <div className="mt-6"><PaymentStatus status={query.data} /></div>
      <Link className="btn-secondary mt-5" to="/shop">Continue shopping</Link>
    </main>
  );
}
