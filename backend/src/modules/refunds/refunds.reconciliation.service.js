export function summarizeRefund(refund) {
  return { id: refund.RefundId, status: refund.RefundStatus, amount: refund.RefundAmount };
}
