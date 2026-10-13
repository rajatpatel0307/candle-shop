import { validateCart } from '../carts/carts.validation.service.js';
import { money } from '../carts/carts.utils.js';
import { calculateShipping } from './checkout.shipping.service.js';
import { calculateTax } from './checkout.tax.service.js';

function calculateDiscount({ subtotal, couponCode }) {
  if (!couponCode) return { amount: 0, code: null, message: null };
  return { amount: 0, code: couponCode, message: 'Discount code captured. Promotion rules are not configured yet.' };
}

export async function priceCheckout({ userId, session, shippingAddress }) {
  const validation = await validateCart(userId);
  const subtotal = money(validation.subtotal);
  const discount = calculateDiscount({ subtotal, couponCode: session?.CouponCode });
  const shipping = calculateShipping({ subtotal: money(subtotal - discount.amount), address: shippingAddress });
  const taxableAmount = money(subtotal - discount.amount + shipping.amount);
  const taxAmount = calculateTax({ taxableAmount, shippingAddress });
  const total = money(subtotal - discount.amount + taxAmount + shipping.amount);

  return {
    cartId: validation.cartId,
    items: validation.items,
    validation,
    subtotal,
    discountAmount: money(discount.amount),
    taxAmount,
    shippingAmount: money(shipping.amount),
    totalAmount: total,
    currencyCode: 'INR',
    discount,
    shipping,
    isValid: validation.isValid && shipping.eligible && validation.items.length > 0,
  };
}
