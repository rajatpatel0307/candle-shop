import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BillingAddressSelector } from '../components/BillingAddressSelector.jsx';
import { CheckoutErrorMessage } from '../components/CheckoutErrorMessage.jsx';
import { CheckoutLoading } from '../components/CheckoutLoading.jsx';
import { CheckoutReview } from '../components/CheckoutReview.jsx';
import { CheckoutSteps } from '../components/CheckoutSteps.jsx';
import { DiscountSection } from '../components/DiscountSection.jsx';
import { OrderItemsSummary } from '../components/OrderItemsSummary.jsx';
import { PaymentMethodSelector } from '../components/PaymentMethodSelector.jsx';
import { PriceBreakdown } from '../components/PriceBreakdown.jsx';
import { ShippingAddressSelector } from '../components/ShippingAddressSelector.jsx';
import { ShippingMethodSelector } from '../components/ShippingMethodSelector.jsx';
import { useCheckout, useCheckoutMutations, useCheckoutState } from '../hooks/useCheckout.js';
import { usePaymentMutations } from '../hooks/usePayment.js';
import { checkoutError, newIdempotencyKey } from '../utils/checkoutHelpers.js';

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

  useEffect(() => {
    if (!checkoutState.sessionId && !actions.create.isPending && !actions.create.isSuccess) {
      actions.create.mutate({ idempotencyKey: newIdempotencyKey() });
    }
  }, [checkoutState.sessionId]);

  useEffect(() => {
    if (checkout?.session) {
      setShippingAddressId(checkout.session.ShippingAddressId || '');
      setBillingAddressId(checkout.session.BillingAddressId || '');
    }
  }, [checkout?.session?.CheckoutSessionId]);

  const pricing = checkout?.pricing;
  const addresses = checkout?.addresses || [];
  const busy = actions.addresses.isPending || actions.submit.isPending || paymentActions.intent.isPending || paymentActions.verify.isPending;
  const canSubmit = pricing?.isValid && shippingAddressId && (useShipping || billingAddressId);

  const currentStep = useMemo(() => {
    if (!shippingAddressId) return 1;
    if (!pricing?.shipping?.eligible) return 2;
    if (!validation?.isValid) return 3;
    return 4;
  }, [shippingAddressId, pricing?.shipping?.eligible, validation?.isValid]);

  async function saveAddresses() {
    const response = await actions.addresses.mutateAsync({
      sessionId: checkout.session.CheckoutSessionId,
      payload: { shippingAddressId, billingAddressId, useShippingAsBilling: useShipping },
    });
    return response.data.data.checkout;
  }

  async function validateCheckout() {
    if (!checkout?.session) return;
    if (shippingAddressId) await saveAddresses();
    const response = await actions.validate.mutateAsync(checkout.session.CheckoutSessionId);
    setValidation(response.data.data.validation);
  }

  async function submitOrder() {
    setSubmitError(null);
    try {
      await saveAddresses();
      const validationResponse = await actions.validate.mutateAsync(checkout.session.CheckoutSessionId);
      setValidation(validationResponse.data.data.validation);
      if (!validationResponse.data.data.validation.isValid) return;

      const submitResponse = await actions.submit.mutateAsync({
        sessionId: checkout.session.CheckoutSessionId,
        payload: { idempotencyKey: newIdempotencyKey(), confirmPriceChanges: true },
      });
      const order = submitResponse.data.data.result.order;
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
          await paymentActions.verify.mutateAsync({
            orderId: order.OrderId,
            payload: {
              providerOrderId: response.razorpay_order_id,
              providerPaymentId: response.razorpay_payment_id,
              providerSignature: response.razorpay_signature,
            },
          });
          navigate(`/payments/result?orderId=${order.OrderId}`);
        },
        modal: {
          ondismiss: () => navigate(`/payments/result?orderId=${order.OrderId}`),
        },
      });
      razorpay.open();
    } catch (error) {
      setSubmitError(error);
    }
  }

  if (actions.create.isPending || query.isLoading) return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><CheckoutLoading /></main>;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase text-[#697565]">Secure checkout</p>
        <h1 className="text-4xl font-semibold">Checkout</h1>
      </div>
      <CheckoutSteps current={currentStep} />
      <CheckoutErrorMessage error={actions.create.error || query.error || submitError} />
      {addresses.length === 0 && <p className="mt-5 rounded-md bg-amber-50 p-3 text-sm text-amber-800">Add an address from account/admin address management before placing an order.</p>}
      {checkout && (
        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-5">
            <ShippingAddressSelector addresses={addresses} value={shippingAddressId} onChange={setShippingAddressId} />
            <BillingAddressSelector addresses={addresses} value={billingAddressId} useShipping={useShipping} onUseShippingChange={setUseShipping} onChange={setBillingAddressId} />
            <ShippingMethodSelector pricing={pricing} />
            <DiscountSection
              code={checkout.session.CouponCode}
              disabled={busy}
              onApply={(code) => actions.applyDiscount.mutate({ sessionId: checkout.session.CheckoutSessionId, payload: { code } })}
              onRemove={() => actions.removeDiscount.mutate(checkout.session.CheckoutSessionId)}
            />
            <PaymentMethodSelector />
            <CheckoutReview validation={validation} />
            {(actions.addresses.error || actions.validate.error || actions.submit.error || paymentActions.intent.error || paymentActions.verify.error) && (
              <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                {checkoutError(actions.addresses.error || actions.validate.error || actions.submit.error || paymentActions.intent.error || paymentActions.verify.error)}
              </p>
            )}
          </div>
          <aside className="grid h-fit gap-5">
            <OrderItemsSummary items={pricing?.items || []} />
            <PriceBreakdown pricing={pricing} />
            <button className="btn-secondary" disabled={busy || !shippingAddressId} onClick={validateCheckout}>Validate checkout</button>
            <button className="btn-primary" disabled={busy || !canSubmit} onClick={submitOrder}>
              {busy ? 'Processing...' : 'Place order and pay'}
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}
