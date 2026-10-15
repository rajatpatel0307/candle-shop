import { useState } from 'react';
import { currency } from '../../../features/orders/utils/ordersHelpers.js';

export function RefundManagementPanel({ refunds = [], onCreate, onApprove, pending }) {
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold">Refunds</h2>
      {refunds.map((refund) => <div key={refund.RefundId} className="mt-3 flex justify-between gap-3 text-sm"><span>{refund.RefundNumber} {currency(refund.RefundAmount, refund.CurrencyCode)} {refund.RefundStatus}</span>{['PENDING','FAILED'].includes(refund.RefundStatus) && <button disabled={pending} className="text-[#8d5132] underline" onClick={() => onApprove(refund.RefundId)}>{refund.RefundStatus === 'FAILED' ? 'Retry':'Approve'}</button>}</div>)}
      <input type="number" min="0.01" step="0.01" aria-label="Refund amount" className="input mt-4" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Amount optional" />
      <input className="input mt-3" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reason" />
      <button className="btn-secondary mt-3" disabled={pending || reason.length < 3} onClick={() => onCreate({ reason, ...(amount ? { amount } : {}) })}>Create refund</button>
    </section>
  );
}
