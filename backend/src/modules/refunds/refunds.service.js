import { AppError } from '../../common/errors/AppError.js';
import { REFUND_STATUS } from './refunds.constants.js';
import * as gateway from './refunds.gateway.service.js';
import * as repo from './refunds.repository.js';

export async function createRefund(orderId, input, userId) {
  const balance = await repo.getRefundableAmount(orderId);
  if (!balance.payment) throw new AppError(409, 'PAYMENT_NOT_REFUNDABLE', 'Order does not have a successful refundable payment.');
  const amount = Number(input.amount || balance.refundable);
  if (amount <= 0 || amount > balance.refundable) {
    throw new AppError(409, 'REFUND_AMOUNT_EXCEEDS_BALANCE', 'Refund amount exceeds the refundable balance.', balance);
  }
  return repo.createRefund({ orderPayment: balance.payment, amount, reason: input.reason, userId, idempotencyKey: input.idempotencyKey });
}

export async function listByOrder(orderId) {
  const balance = await repo.getRefundableAmount(orderId);
  return { refunds: await repo.listRefundsByOrder(orderId), balance };
}

export async function getRefund(refundId) {
  const refund = await repo.getRefund(refundId);
  if (!refund) throw new AppError(404, 'REFUND_NOT_FOUND', 'Refund was not found.');
  return refund;
}

export async function approve(refundId, userId) {
  const refund = await getRefund(refundId);
  if (![REFUND_STATUS.PENDING, REFUND_STATUS.FAILED].includes(refund.RefundStatus)) {
    throw new AppError(409, 'REFUND_NOT_APPROVABLE', 'Refund cannot be approved in its current state.');
  }
  const payment = await repo.getOrderPayment(refund.OrderId);
  const provider = await gateway.createProviderRefund({ payment, refund });
  const status = provider.status === REFUND_STATUS.SUCCEEDED ? REFUND_STATUS.SUCCEEDED : REFUND_STATUS.PROCESSING;
  return repo.updateRefundStatus({ refundId, status, providerRefundId: provider.providerRefundId, approvedByUserId: userId });
}

export async function retry(refundId, userId) {
  return approve(refundId, userId);
}

export async function listAdmin() {
  return repo.listAdminRefunds();
}
