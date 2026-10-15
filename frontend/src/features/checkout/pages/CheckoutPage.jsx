import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Flame, LockKeyhole, Plus, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth.js';
import { checkoutApi } from '../api/checkoutApi.js';
import { DeliveryAddressForm } from '../components/DeliveryAddressForm.jsx';
import { CheckoutStepPanel } from '../components/CheckoutStepPanel.jsx';
import { BillingAddressSelector } from '../components/BillingAddressSelector.jsx';
import { CheckoutErrorMessage } from '../components/CheckoutErrorMessage.jsx';
import { CheckoutLoading } from '../components/CheckoutLoading.jsx';
import { CheckoutReview } from '../components/CheckoutReview.jsx';
import { DiscountSection } from '../components/DiscountSection.jsx';
import { OrderItemsSummary } from '../components/OrderItemsSummary.jsx';
import { PaymentMethodSelector } from '../components/PaymentMethodSelector.jsx';
import { PriceBreakdown } from '../components/PriceBreakdown.jsx';
import { ShippingAddressSelector } from '../components/ShippingAddressSelector.jsx';
import { ShippingMethodSelector } from '../components/ShippingMethodSelector.jsx';
import { useCheckout, useCheckoutMutations, useCheckoutState } from '../hooks/useCheckout.js';
import { usePaymentMutations } from '../hooks/usePayment.js';
import { currency, newIdempotencyKey, selectedAddressLabel } from '../utils/checkoutHelpers.js';

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const checkoutState = useCheckoutState();
  const actions = useCheckoutMutations();
  const paymentActions = usePaymentMutations();
  const query = useCheckout(checkoutState.sessionId);
  const checkout = query.data || actions.create.data?.data?.data?.checkout;
  const [shippingAddressId, setShippingAddressId] = useState('');
  const [billingAddressId, setBillingAddressId] = useState('');
  const [useShipping, setUseShipping] = useState(true);
  const [validation, setValidation] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [step, setStep] = useState(2);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addedAddresses, setAddedAddresses] = useState([]);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const sessionKey = useRef(newIdempotencyKey());
  const submitKey = useRef(newIdempotencyKey());
  const pendingOrder = useRef(null);
  const startingSession = useRef(false);
  const addAddress = useMutation({ mutationFn: checkoutApi.createAddress });

  useEffect(() => {
    if (!checkoutState.sessionId && !startingSession.current) {
      startingSession.current = true;
      actions.create.mutate({ idempotencyKey: sessionKey.current });
    }
  }, [checkoutState.sessionId]);

  useEffect(() => {
    if (checkout?.session) {
      const defaultAddress = checkout.addresses?.find((address) => address.IsDefaultShipping) || checkout.addresses?.[0];
      setShippingAddressId(checkout.session.ShippingAddressId || defaultAddress?.AddressId || '');
      setBillingAddressId(checkout.session.BillingAddressId || '');
      setUseShipping(!checkout.session.BillingAddressId || checkout.session.BillingAddressId === checkout.session.ShippingAddressId);
    }
  }, [checkout?.session?.CheckoutSessionId]);

  const pricing = checkout?.pricing;
  const addresses = [...(checkout?.addresses || []), ...addedAddresses.filter((address) => !checkout?.addresses?.some((saved) => saved.AddressId === address.AddressId))];
  const busy = actions.addresses.isPending || actions.validate.isPending || actions.submit.isPending || actions.applyDiscount.isPending || actions.removeDiscount.isPending || addAddress.isPending || paymentActions.intent.isPending || paymentActions.verify.isPending || paymentOpen;
  const canSubmit = pricing?.isValid && shippingAddressId && (useShipping || billingAddressId);

  async function saveNewAddress(payload) {
    setSubmitError(null);
    try {
      const response = await addAddress.mutateAsync(payload);
      const address = response.data.data.address;
      setAddedAddresses((current) => [...current, address]);
      setShippingAddressId(address.AddressId);
      setShowAddressForm(false);
      setValidation(null);
    } catch (error) { setSubmitError(error); }
  }

  function restartCheckout() {
    setSubmitError(null);
    sessionKey.current = newIdempotencyKey();
    submitKey.current = newIdempotencyKey();
    pendingOrder.current = null;
    setStep(2);
    setValidation(null);
    actions.create.mutate({ idempotencyKey: sessionKey.current });
  }

  async function saveAddresses() {
    const response = await actions.addresses.mutateAsync({
      sessionId: checkout.session.CheckoutSessionId,
      payload: { shippingAddressId, ...(useShipping ? {} : { billingAddressId }), useShippingAsBilling: useShipping },
    });
    return response.data.data.checkout;
  }

  async function continueFromAddress() {
    setSubmitError(null);
    try {
      const saved = await saveAddresses();
      if (!saved.pricing?.isValid) throw new Error(saved.pricing?.shipping?.message || 'Please resolve the stock or pricing issues in your cart.');
      setValidation(null);
      setStep(3);
    } catch (error) { setSubmitError(error); }
  }

  async function continueToPayment() {
    setSubmitError(null);
    try {
      const response = await actions.validate.mutateAsync(checkout.session.CheckoutSessionId);
      setValidation(response.data.data.validation);
      if (response.data.data.validation.isValid) setStep(4);
    } catch (error) { setSubmitError(error); }
  }

  async function submitOrder() {
    setSubmitError(null);
    setPaymentOpen(true);
    try {
      let order = pendingOrder.current;
      if (!order) {
        await saveAddresses();
        const validationResponse = await actions.validate.mutateAsync(checkout.session.CheckoutSessionId);
        setValidation(validationResponse.data.data.validation);
        if (!validationResponse.data.data.validation.isValid) { setPaymentOpen(false); return; }

        const submitResponse = await actions.submit.mutateAsync({
          sessionId: checkout.session.CheckoutSessionId,
          payload: { idempotencyKey: submitKey.current, confirmPriceChanges: true, paymentMethod },
        });
        order = submitResponse.data.data.result.order;
        pendingOrder.current = order;
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      }
      if (order.PaymentMethod === 'COD') {
        navigate(`/orders/${order.OrderId}/confirmation`);
        return;
      }
      const intentResponse = await paymentActions.intent.mutateAsync({
        orderId: order.OrderId,
        payload: { idempotencyKey: newIdempotencyKey() },
      });
      const intent = intentResponse.data.data.payment;
      const nextAction = intent.nextAction;

      if (nextAction.mode !== 'RAZORPAY_CHECKOUT' || !nextAction.keyId) {
        navigate(`/payments/result?orderId=${order.OrderId}`);
        return;
      }

      const loaded = await loadRazorpay();
      if (!loaded) throw new Error('Could not load Razorpay checkout.');
      const razorpay = new window.Razorpay({
        key: nextAction.keyId,
        amount: nextAction.amount,
        currency: nextAction.currency,
        name: 'Candle Studio',
        description: order.OrderNumber,
        order_id: nextAction.providerOrderId,
        handler: async (response) => {
          try {
            await paymentActions.verify.mutateAsync({
              orderId: order.OrderId,
              payload: {
                providerOrderId: response.razorpay_order_id,
                providerPaymentId: response.razorpay_payment_id,
                providerSignature: response.razorpay_signature,
              },
            });
            navigate(`/payments/result?orderId=${order.OrderId}`);
          } catch (error) {
            setSubmitError(error);
            navigate(`/payments/result?orderId=${order.OrderId}`);
          } finally { setPaymentOpen(false); }
        },
        modal: {
          ondismiss: () => { setPaymentOpen(false); navigate(`/payments/result?orderId=${order.OrderId}`); },
        },
      });
      setPaymentOpen(true);
      razorpay.open();
    } catch (error) {
      setPaymentOpen(false);
      setSubmitError(error);
    }
  }

  const loading = actions.create.isPending || query.isLoading;
  const connectionError = actions.create.error || query.error;
  const sessionRejected = ['CHECKOUT_SESSION_INACTIVE', 'CHECKOUT_SESSION_NOT_FOUND'].includes(submitError?.response?.data?.error?.code);
  const expired = !pendingOrder.current && checkout?.session && (sessionRejected || !['ACTIVE', 'OPEN'].includes(String(checkout.session.SessionStatus).toUpperCase()) || new Date(checkout.session.ExpiresAtUtc) <= new Date());
  const selectedAddress = addresses.find((address) => address.AddressId === shippingAddressId);
  const changeStep = (next) => { setStep(next); setSubmitError(null); setValidation(null); };

  return (
    <div className="min-h-screen bg-[#f4f1ec] text-[#2f2722]">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold"><Flame className="h-6 w-6 text-[#b56b45]" />Candle Studio</Link>
          <span className="flex items-center gap-2 text-xs font-medium text-stone-500 sm:text-sm"><LockKeyhole className="h-4 w-4" />Secure checkout</span>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold sm:text-3xl">Checkout</h1>
          <Link to="/cart" className="flex items-center gap-2 text-sm font-medium text-stone-600"><ArrowLeft className="h-4 w-4" />Back to cart</Link>
        </div>
        {loading ? <CheckoutLoading /> : connectionError || !checkout ? (
          <section className="grid gap-4 rounded-lg border border-stone-200 bg-white p-6" role="alert">
            <h2 className="text-lg font-semibold">We couldn't load your checkout</h2>
            <CheckoutErrorMessage error={connectionError} />
            <p className="text-sm text-stone-600">Your order has not been placed. Try again to continue.</p>
            <button type="button" className="btn-primary w-fit" onClick={() => query.error?.response?.status === 404 ? restartCheckout() : checkoutState.sessionId && !actions.create.error ? query.refetch() : actions.create.mutate({ idempotencyKey: sessionKey.current })}>Try again</button>
            <Link to="/cart" className="text-sm font-semibold text-[#8d5132]">Return to cart</Link>
          </section>
        ) : expired ? (
          <section className="grid gap-4 rounded-lg border bg-white p-6">
            <h2 className="text-lg font-semibold">Start a fresh checkout</h2>
            <p className="text-sm text-stone-600">This checkout has expired or has already been used.</p>
            <button type="button" className="btn-primary w-fit" onClick={restartCheckout}>Start again</button>
            {checkoutState.orderId && <Link className="text-sm underline" to={`/payments/result?orderId=${checkoutState.orderId}`}>View your last order</Link>}
          </section>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="grid min-w-0 gap-4">
              <CheckoutStepPanel number={1} title="Logged in" complete summary={`${user?.firstName || 'Your account'} | ${user?.email || ''}`} />
              <CheckoutStepPanel number={2} title="Delivery address" active={step === 2} complete={step > 2} summary={step > 2 ? selectedAddressLabel(selectedAddress) : ''} onChange={step > 2 && !pendingOrder.current ? () => changeStep(2) : undefined} disabled={busy}>
                <ShippingAddressSelector addresses={addresses} value={shippingAddressId} onChange={(id) => { setShippingAddressId(id); setValidation(null); }} />
                {(showAddressForm || addresses.length === 0) ? (
                  <DeliveryAddressForm pending={addAddress.isPending} onSave={saveNewAddress} onCancel={() => setShowAddressForm(false)} />
                ) : <button type="button" className="flex w-fit items-center gap-2 text-sm font-semibold text-[#8d5132]" onClick={() => setShowAddressForm(true)}><Plus className="h-4 w-4" />Add a new address</button>}
                <BillingAddressSelector addresses={addresses} value={billingAddressId} useShipping={useShipping} onUseShippingChange={setUseShipping} onChange={setBillingAddressId} />
                <button type="button" className="btn-primary w-fit" disabled={busy || !shippingAddressId || (!useShipping && !billingAddressId) || showAddressForm} onClick={continueFromAddress}>{actions.addresses.isPending ? 'Saving...' : 'Deliver here'}</button>
              </CheckoutStepPanel>
              <CheckoutStepPanel number={3} title="Order summary" active={step === 3} complete={step > 3} summary={step > 3 ? `${pricing?.items?.reduce((sum, item) => sum + Number(item.Quantity), 0)} items | ${currency(pricing?.totalAmount)}` : ''} onChange={step > 3 && !pendingOrder.current ? () => changeStep(3) : undefined} disabled={busy}>
                <OrderItemsSummary items={pricing?.items || []} />
                <Link to="/cart" className="text-sm font-semibold text-[#8d5132]">Edit items in cart</Link>
                <ShippingMethodSelector pricing={pricing} />
                <DiscountSection code={checkout.session.CouponCode} disabled={busy}
                  onApply={(code) => { setValidation(null); actions.applyDiscount.mutate({ sessionId: checkout.session.CheckoutSessionId, payload: { code } }, { onError: setSubmitError }); }}
                  onRemove={() => { setValidation(null); actions.removeDiscount.mutate(checkout.session.CheckoutSessionId, { onError: setSubmitError }); }} />
                {pricing?.discount?.message && <p className="text-sm text-stone-600">{pricing.discount.message}</p>}
                <CheckoutReview validation={validation} />
                {pricing?.validation?.errors?.map((error, index) => <p key={index} className="text-sm text-red-700">{error.message}</p>)}
                <button type="button" className="btn-primary w-fit" disabled={busy || !pricing?.isValid} onClick={continueToPayment}>{actions.validate.isPending ? 'Checking order...' : 'Continue to payment'}</button>
              </CheckoutStepPanel>
              <CheckoutStepPanel number={4} title="Payment options" active={step === 4}>
                <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} onlineAvailable={checkout.paymentConfig?.available} />
                <p className="text-sm leading-6 text-stone-500">{paymentMethod === 'COD' ? 'Confirm your order now and pay on delivery.' : "You'll choose your payment method in the secure payment window."}</p>
                <CheckoutReview validation={validation} />
                <button type="button" className="btn-primary w-full sm:w-fit" disabled={busy || (!pendingOrder.current && (!canSubmit || !validation?.isValid)) || (paymentMethod === 'ONLINE' && !checkout.paymentConfig?.available)} onClick={submitOrder}>{busy ? 'Processing...' : paymentMethod === 'COD' ? `Place order · ${currency(pricing?.totalAmount)}` : `Pay ${currency(pricing?.totalAmount)}`}</button>
              </CheckoutStepPanel>
              <CheckoutErrorMessage error={submitError} />
            </div>
            <aside className="grid gap-4 lg:sticky lg:top-6">
              <PriceBreakdown pricing={pricing} />
              <p className="flex items-start gap-3 px-3 text-sm leading-6 text-stone-500"><ShieldCheck className="mt-1 h-5 w-5 shrink-0" />Your address and order details are sent securely. Payment is handled by Razorpay.</p>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
