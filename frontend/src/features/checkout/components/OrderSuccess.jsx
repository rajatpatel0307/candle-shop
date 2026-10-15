import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { clearCheckout } from '../store/checkoutSlice.js';
import { useAuth } from '../../auth/hooks/useAuth.js';
import { cartApi } from '../../cart/api/cartApi.js';
import { setCartSummary } from '../../cart/store/cartSlice.js';

export function isOrderConfirmed(order) {
  return Boolean(order && ['CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.OrderStatus)
    && (order.PaymentMethod === 'COD' || order.PaymentStatus === 'SUCCEEDED'));
}

export function OrderSuccess({ order }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    dispatch(clearCheckout());
    const queryKey = ['cart', user?.id];
    let active = true;
    async function refreshCart() {
      await queryClient.cancelQueries({ queryKey });
      if (!active) return;
      try {
        const cart = await queryClient.fetchQuery({
          queryKey,
          queryFn: async () => (await cartApi.get()).data.data.cart,
          staleTime: 0,
        });
        if (active) dispatch(setCartSummary(cart.summary));
      } catch {
        queryClient.invalidateQueries({ queryKey });
      }
    }
    if (user?.id) refreshCart();
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    const timeout = window.setTimeout(() => navigate('/', { replace: true }), 2000);
    return () => { active = false; window.clearTimeout(timeout); };
  }, [order.OrderId, user?.id, navigate, dispatch, queryClient]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f2ea] px-4 py-12 text-[#2f2722]">
      <section className="order-success-card w-full max-w-md overflow-hidden rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-lg sm:p-10" role="status" aria-live="polite">
        <div className="relative mx-auto mb-7 h-28 w-28" aria-hidden="true">
          <span className="order-success-halo absolute inset-0 rounded-full bg-green-100" />
          <svg className="relative h-full w-full text-green-600" viewBox="0 0 112 112" fill="none">
            <circle className="order-success-circle" cx="56" cy="56" r="43" stroke="currentColor" strokeWidth="4" />
            <path className="order-success-check" d="M35 57L49 71L78 42" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {Array.from({ length: 8 }, (_, index) => <span key={index} className="order-success-spark absolute left-1/2 top-1/2" style={{ '--spark-angle': `${index * 45}deg`, '--spark-color': index % 2 ? '#b56b45' : '#65a779' }} />)}
        </div>
        <h1 className="text-3xl font-semibold">Order confirmed!</h1>
        <p className="mt-3 text-stone-600">Thank you for shopping with Candle Studio.</p>
        <p className="mt-4 text-sm font-semibold">{order.OrderNumber}</p>
        {order.PaymentMethod === 'COD' && <p className="mt-1 text-sm text-stone-500">Pay when your order arrives.</p>}
        <p className="mt-7 text-sm text-stone-500">Taking you home in 2 seconds...</p>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-stone-100" aria-hidden="true"><div className="order-success-progress h-full origin-left rounded-full bg-[#b56b45]" /></div>
        <Link to="/" replace className="mt-5 inline-block text-sm font-semibold text-[#8d5132] underline">Go home now</Link>
      </section>
    </main>
  );
}
