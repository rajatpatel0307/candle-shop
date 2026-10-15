import { useState } from 'react';
const nextStatuses = {CONFIRMED:['PROCESSING'],PROCESSING:['READY_TO_SHIP'],READY_TO_SHIP:['SHIPPED'],SHIPPED:['DELIVERED','RETURN_REQUESTED'],DELIVERED:['RETURN_REQUESTED'],CANCELLATION_REQUESTED:['PROCESSING'],RETURN_REQUESTED:['RETURNED']};
export function OrderStatusUpdater({onSubmit,pending,currentStatus}) {
  const options = nextStatuses[currentStatus] || [];
  const [status,setStatus] = useState(options[0] || '');
  const [reason,setReason] = useState('');
  return <form className="admin-panel" onSubmit={(event) => {event.preventDefault();onSubmit({status,reason});}}><h2 className="text-lg font-semibold">Order status</h2><p className="mt-2 text-xs text-stone-500">Current: {currentStatus?.replaceAll('_',' ')}</p>{options.length ? <><select aria-label="Next order status" className="input mt-4" value={status} onChange={(event) => setStatus(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select><input aria-label="Reason for status change" maxLength={500} className="input mt-3" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reason (optional)" /><button className="btn-primary mt-3" disabled={pending}>Save status</button></> : <p className="mt-4 text-sm text-stone-500">No processing actions are available for this status.</p>}</form>;
}
