import { useState } from 'react';

export function OrderStatusUpdater({ onSubmit, pending }) {
  const [status, setStatus] = useState('PROCESSING');
  const [reason, setReason] = useState('');
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold">Update status</h2>
      <select className="input mt-4" value={status} onChange={(event) => setStatus(event.target.value)}>
        {['PROCESSING', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
      <input className="input mt-3" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reason" />
      <button className="btn-primary mt-3" disabled={pending} onClick={() => onSubmit({ status, reason })}>Save status</button>
    </section>
  );
}
