import { AppError } from '../../common/errors/AppError.js';
import { validateCart } from '../carts/carts.validation.service.js';
import { getCart } from '../carts/carts.service.js';
import { getPublicPaymentConfig } from '../payments/payments.gateway.service.js';
import { DEFAULT_SESSION_MINUTES } from './checkout.constants.js';
import * as repo from './checkout.repository.js';
import { priceCheckout } from './checkout.pricing.service.js';
import { validateShippingAddress } from './checkout.shipping.service.js';

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

async function requireSession(userId, sessionId) {
  const session = await repo.getSessionForUser({ userId, sessionId });
  if (!session) throw new AppError(404, 'CHECKOUT_SESSION_NOT_FOUND', 'Checkout session was not found.');
  return session;
}

async function getSessionAddresses(userId, session) {
  const shippingAddress = session.ShippingAddressId
    ? await repo.getUserAddress({ userId, addressId: session.ShippingAddressId })
    : null;
  const billingAddress = session.BillingAddressId
    ? await repo.getUserAddress({ userId, addressId: session.BillingAddressId })
    : shippingAddress;
  return { shippingAddress, billingAddress };
}

export async function createSession(userId, input) {
  const cart = await validateCart(userId);
  if (!cart.items.length) throw new AppError(400, 'EMPTY_CART', 'Add items to the cart before checkout.');
  if (!cart.isValid) throw new AppError(409, 'CART_INVALID', 'Resolve cart issues before checkout.', cart.errors);
  const result = await repo.createSession({
    userId,
    cartId: cart.cartId,
    idempotencyKey: input.idempotencyKey,
    expiresAt: addMinutes(new Date(), DEFAULT_SESSION_MINUTES),
  });
  return enrichSession(userId, result.session, result.idempotent);
}

export async function getSession(userId, sessionId) {
  return enrichSession(userId, await requireSession(userId, sessionId));
}

export async function updateAddresses(userId, sessionId, input) {
  const shipping = await repo.getUserAddress({ userId, addressId: input.shippingAddressId });
  if (!shipping) throw new AppError(404, 'SHIPPING_ADDRESS_NOT_FOUND', 'Shipping address was not found.');
  const billingAddressId = input.useShippingAsBilling ? input.shippingAddressId : input.billingAddressId;
  if (!billingAddressId) throw new AppError(400, 'BILLING_ADDRESS_REQUIRED', 'Billing address is required.');
  const billing = await repo.getUserAddress({ userId, addressId: billingAddressId });
  if (!billing) throw new AppError(404, 'BILLING_ADDRESS_NOT_FOUND', 'Billing address was not found.');
  const shippingValidation = validateShippingAddress(shipping);
  if (!shippingValidation.valid) throw new AppError(400, 'INVALID_SHIPPING_ADDRESS', 'Shipping address is incomplete.', shippingValidation);
  const session = await repo.updateAddresses({ sessionId, userId, shippingAddressId: input.shippingAddressId, billingAddressId });
  if (!session) throw new AppError(404, 'CHECKOUT_SESSION_NOT_FOUND', 'Active checkout session was not found.');
  return enrichSession(userId, session);
}

export async function updateShippingMethod(userId, sessionId, input) {
  const session = await repo.updateShippingMethod({ sessionId, userId, shippingMethodId: input.shippingMethodId });
  if (!session) throw new AppError(404, 'CHECKOUT_SESSION_NOT_FOUND', 'Active checkout session was not found.');
  return enrichSession(userId, session);
}

export async function applyDiscount(userId, sessionId, input) {
  const session = await repo.updateDiscount({ sessionId, userId, couponCode: input.code });
  if (!session) throw new AppError(404, 'CHECKOUT_SESSION_NOT_FOUND', 'Active checkout session was not found.');
  return enrichSession(userId, session);
}

export async function removeDiscount(userId, sessionId) {
  const session = await repo.updateDiscount({ sessionId, userId, couponCode: null });
  if (!session) throw new AppError(404, 'CHECKOUT_SESSION_NOT_FOUND', 'Active checkout session was not found.');
  return enrichSession(userId, session);
}

export async function getSummary(userId, sessionId) {
  const session = await requireSession(userId, sessionId);
  const { shippingAddress } = await getSessionAddresses(userId, session);
  return priceCheckout({ userId, session, shippingAddress });
}

export async function validateSession(userId, sessionId) {
  const session = await requireSession(userId, sessionId);
  const { shippingAddress, billingAddress } = await getSessionAddresses(userId, session);
  const shippingValidation = validateShippingAddress(shippingAddress);
  const pricing = await priceCheckout({ userId, session, shippingAddress });
  return {
    isValid: pricing.isValid && shippingValidation.valid && Boolean(billingAddress),
    pricing,
    addressValidation: {
      shipping: shippingValidation,
      billing: { valid: Boolean(billingAddress), missing: billingAddress ? [] : ['BillingAddressId'] },
    },
  };
}

export async function submit(userId, sessionId, input) {
  const existing = await repo.findOrderByIdempotencyKey({ userId, idempotencyKey: input.idempotencyKey });
  if (existing) return { order: existing, idempotent: true, cart: await getCart(userId) };

  const session = await requireSession(userId, sessionId);
  if (session.OrderId) {
    const order = await repo.findOrderForSession({ userId, sessionId });
    if (order) return { order, idempotent: true, cart: await getCart(userId) };
  }
  if (!['ACTIVE', 'OPEN'].includes(String(session.SessionStatus).toUpperCase()) || new Date(session.ExpiresAtUtc) <= new Date()) {
    throw new AppError(409, 'CHECKOUT_SESSION_INACTIVE', 'This checkout has expired. Start a new checkout.');
  }
  if (input.paymentMethod === 'ONLINE' && !getPublicPaymentConfig().available) {
    throw new AppError(503, 'PAYMENT_PROVIDER_NOT_CONFIGURED', 'Online payment is currently unavailable. Choose cash on delivery.');
  }
  const { shippingAddress, billingAddress } = await getSessionAddresses(userId, session);
  const validation = await validateSession(userId, sessionId);
  if (!validation.isValid) throw new AppError(409, 'CHECKOUT_INVALID', 'Checkout is not ready to submit.', validation);

  const result = await repo.createOrderTransaction({
    userId,
    session,
    pricing: validation.pricing,
    shippingAddress,
    billingAddress,
    idempotencyKey: input.idempotencyKey,
    paymentMethod: input.paymentMethod,
  });

  return { order: result.order, idempotent: result.idempotent, cart: await getCart(userId) };
}

export async function enrichSession(userId, session, idempotent = false) {
  const addresses = await repo.listUserAddresses(userId);
  const { shippingAddress, billingAddress } = await getSessionAddresses(userId, session);
  const pricing = await priceCheckout({ userId, session, shippingAddress });
  return { session, addresses, shippingAddress, billingAddress, pricing, idempotent, paymentConfig: getPublicPaymentConfig() };
}
