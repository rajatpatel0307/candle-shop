import { AppError } from '../../common/errors/AppError.js';

function config() {
  return { keyId: process.env.RAZORPAY_KEY_ID, keySecret: process.env.RAZORPAY_KEY_SECRET };
}

export async function createProviderRefund({ payment, refund }) {
  const { keyId, keySecret } = config();
  if (!keyId || !keySecret || !payment.ProviderPaymentId) {
    return {
      mode: 'MANUAL',
      providerRefundId: `manual_${refund.RefundId}`,
      status: 'PROCESSING',
      message: 'Razorpay credentials or provider payment id are not configured; refund requires manual processing.',
    };
  }
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  const response = await fetch(`https://api.razorpay.com/v1/payments/${payment.ProviderPaymentId}/refund`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: Math.round(Number(refund.RefundAmount) * 100),
      notes: { refundId: refund.RefundId, orderId: refund.OrderId },
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new AppError(502, 'REFUND_PROVIDER_ERROR', 'Refund provider rejected the request.', { reason: payload?.error?.description });
  }
  return { mode: 'RAZORPAY', providerRefundId: payload.id, status: payload.status === 'processed' ? 'SUCCEEDED' : 'PROCESSING' };
}
