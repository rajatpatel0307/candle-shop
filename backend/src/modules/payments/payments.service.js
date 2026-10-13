import { AppError } from '../../common/errors/AppError.js';
import { confirmReservation, releaseReservation } from '../inventory/inventory.service.js';
import { PAYMENT_STATUS, WEBHOOK_STATUS } from './payments.constants.js';
import * as gateway from './payments.gateway.service.js';
import * as repo from './payments.repository.js';

async function requireOrder(userId, orderId) {
  const order = await repo.getOrderForUser({ userId, orderId });
  if (!order) throw new AppError(404, 'ORDER_NOT_FOUND', 'Order was not found.');
  return order;
}

export async function createIntent(userId, orderId, input) {
  const order = await requireOrder(userId, orderId);
  if (order.PaymentStatus === PAYMENT_STATUS.SUCCEEDED) {
    throw new AppError(409, 'ORDER_ALREADY_PAID', 'This order is already paid.');
  }
  const { payment } = await repo.createPendingPayment({ order, idempotencyKey: input.idempotencyKey });
  if (payment.ProviderOrderId) {
    return {
      order,
      payment,
      nextAction: {
        provider: payment.PaymentProvider,
        mode: 'RAZORPAY_CHECKOUT',
        providerOrderId: payment.ProviderOrderId,
        keyId: gateway.getPublicPaymentConfig().keyId,
        amount: Math.round(Number(payment.Amount) * 100),
        currency: payment.CurrencyCode,
        orderReference: order.OrderNumber,
      },
      publicConfig: gateway.getPublicPaymentConfig(),
    };
  }
  const nextAction = await gateway.createPayment({ order, payment, idempotencyKey: input.idempotencyKey });
  const updated = nextAction.providerOrderId
    ? await repo.attachProviderOrder({ paymentId: payment.PaymentId, providerOrderId: nextAction.providerOrderId })
    : payment;
  return { order, payment: updated, nextAction, publicConfig: gateway.getPublicPaymentConfig() };
}

export async function getStatus(userId, orderId) {
  const order = await requireOrder(userId, orderId);
  const payment = await repo.getLatestPayment(orderId);
  return { order, payment };
}

export async function verify(userId, orderId, input) {
  await requireOrder(userId, orderId);
  const isValid = gateway.verifyPaymentSignature(input);
  if (!isValid) throw new AppError(400, 'INVALID_PAYMENT_SIGNATURE', 'Payment signature is invalid.');
  const result = await repo.markPaymentSucceeded({
    providerOrderId: input.providerOrderId,
    providerPaymentId: input.providerPaymentId,
  });
  if (!result) throw new AppError(404, 'PAYMENT_NOT_FOUND', 'Payment was not found.');
  await confirmOrderReservations(result.payment.OrderId, userId);
  return result;
}

export async function retry(userId, orderId, input) {
  const status = await getStatus(userId, orderId);
  if (status.order.PaymentStatus === PAYMENT_STATUS.SUCCEEDED) {
    throw new AppError(409, 'ORDER_ALREADY_PAID', 'This order is already paid.');
  }
  return createIntent(userId, orderId, input);
}

export async function processWebhook({ rawBody, signature, payload }) {
  if (!gateway.verifyWebhookSignature(rawBody, signature)) {
    throw new AppError(400, 'INVALID_WEBHOOK_SIGNATURE', 'Webhook signature is invalid.');
  }
  const event = gateway.parseWebhook(payload);
  const claimed = await repo.insertWebhookEvent({
    providerEventId: event.providerEventId,
    eventType: event.eventType,
    payloadJson: JSON.stringify(payload),
  });
  if (claimed.duplicate) return { duplicate: true };

  try {
    if (event.eventType === 'payment.captured' || event.eventType === 'payment.authorized') {
      if (!event.providerOrderId || !event.providerPaymentId) throw new Error('Webhook did not include payment references.');
      await repo.markPaymentSucceeded({
        providerOrderId: event.providerOrderId,
        providerPaymentId: event.providerPaymentId,
      }).then(async (result) => {
        if (result?.payment?.OrderId) await confirmOrderReservations(result.payment.OrderId, null);
      });
    }
    if (event.eventType === 'payment.failed') {
      const failed = await repo.markPaymentFailed({
        providerOrderId: event.providerOrderId,
        code: payload?.payload?.payment?.entity?.error_code,
        message: payload?.payload?.payment?.entity?.error_description,
      });
      if (failed?.OrderId) await releaseOrderReservations(failed.OrderId);
    }
    await repo.completeWebhookEvent({ providerEventId: event.providerEventId, status: WEBHOOK_STATUS.PROCESSED });
    return { duplicate: false, event };
  } catch (error) {
    await repo.completeWebhookEvent({ providerEventId: event.providerEventId, status: WEBHOOK_STATUS.FAILED, error: error.message });
    throw error;
  }
}

async function confirmOrderReservations(orderId, userId) {
  const reservations = await repo.listActiveReservationsForOrder(orderId);
  for (const reservation of reservations) {
    await confirmReservation(reservation.InventoryReservationId, { orderId }, userId);
  }
}

async function releaseOrderReservations(orderId) {
  const reservations = await repo.listActiveReservationsForOrder(orderId);
  for (const reservation of reservations) {
    await releaseReservation(reservation.InventoryReservationId);
  }
}
