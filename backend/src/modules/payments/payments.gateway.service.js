import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { env } from '../../config/env.js';
import { AppError } from '../../common/errors/AppError.js';
import { PAYMENT_PROVIDER } from './payments.constants.js';

function getRazorpayConfig() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  return { keyId, keySecret, webhookSecret };
}

function toPaise(amount) {
  return Math.round(Number(amount) * 100);
}

function safeCompare(a, b) {
  const left = Buffer.from(a || '');
  const right = Buffer.from(b || '');
  return left.length === right.length && timingSafeEqual(left, right);
}

export function getPublicPaymentConfig() {
  const config = getRazorpayConfig();
  return { provider: PAYMENT_PROVIDER.RAZORPAY, keyId: config.keyId || null, available: Boolean(config.keyId && config.keySecret) };
}

export async function createPayment({ order, payment, idempotencyKey }) {
  const config = getRazorpayConfig();
  if (!config.keyId || !config.keySecret) {
    throw new AppError(503, 'PAYMENT_PROVIDER_NOT_CONFIGURED', 'Online payment is currently unavailable. Choose cash on delivery.');
  }

  const auth = Buffer.from(`${config.keyId}:${config.keySecret}`).toString('base64');
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': idempotencyKey || randomUUID(),
    },
    body: JSON.stringify({
      amount: toPaise(order.GrandTotal),
      currency: order.CurrencyCode,
      receipt: order.OrderNumber,
      notes: { orderId: order.OrderId, paymentId: payment.PaymentId, environment: env.NODE_ENV },
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new AppError(502, 'PAYMENT_PROVIDER_ERROR', 'Payment provider rejected the order creation request.', {
      provider: PAYMENT_PROVIDER.RAZORPAY,
      status: response.status,
      reason: payload?.error?.description,
    });
  }

  return {
    provider: PAYMENT_PROVIDER.RAZORPAY,
    mode: 'RAZORPAY_CHECKOUT',
    providerOrderId: payload.id,
    keyId: config.keyId,
    amount: payload.amount,
    currency: payload.currency,
    orderReference: order.OrderNumber,
  };
}

export function verifyPaymentSignature({ providerOrderId, providerPaymentId, providerSignature }) {
  const { keySecret } = getRazorpayConfig();
  if (!keySecret) throw new AppError(500, 'PAYMENT_PROVIDER_NOT_CONFIGURED', 'Razorpay secret is not configured.');
  const expected = createHmac('sha256', keySecret)
    .update(`${providerOrderId}|${providerPaymentId}`)
    .digest('hex');
  return safeCompare(expected, providerSignature);
}

export function verifyWebhookSignature(rawBody, signature) {
  const { webhookSecret } = getRazorpayConfig();
  if (!webhookSecret) throw new AppError(500, 'WEBHOOK_SECRET_NOT_CONFIGURED', 'Razorpay webhook secret is not configured.');
  const expected = createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
  return safeCompare(expected, signature);
}

export function parseWebhook(payload) {
  const payment = payload?.payload?.payment?.entity;
  const order = payload?.payload?.order?.entity;
  return {
    providerEventId: payload?.id || `${payload?.event || 'event'}:${payment?.id || order?.id || Date.now()}`,
    eventType: payload?.event || 'unknown',
    providerPaymentId: payment?.id ?? null,
    providerOrderId: payment?.order_id ?? order?.id ?? null,
    amount: payment?.amount ? Number(payment.amount) / 100 : null,
    currency: payment?.currency ?? order?.currency ?? null,
    status: payment?.status ?? order?.status ?? null,
  };
}
