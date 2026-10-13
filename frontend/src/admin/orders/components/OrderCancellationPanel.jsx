import { useState } from 'react';

export function OrderCancellationPanel({ onCancel, pending }) {
  const [reason, setReason] = useState('');
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold">Cancel order</h2>
      <textarea className="input mt-4 min-h-24" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reason" />
      <button className="btn-secondary mt-3" disabled={pending || reason.length < 3} onClick={() => onCancel({ reason })}>Cancel order</button>
    </section>
  );
}
