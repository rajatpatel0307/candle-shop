import { useState } from 'react';
import { receiptSchema } from '../schemas/inventorySchemas.js';

export function StockReceiptForm({ item, mutation }) {
  const [form, setForm] = useState({ quantity: '', referenceType: '', notes: '' });
  const [error, setError] = useState('');

  function submit(event) {
    event.preventDefault();
    const parsed = receiptSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Invalid receipt.');
      return;
    }
    setError('');
    mutation.mutate(parsed.data);
  }

  return (
    <form className="grid gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-sm" onSubmit={submit}>
      <h2 className="text-lg font-semibold">Record stock receipt</h2>
      <p className="text-sm text-stone-500">Current physical stock: {item?.OnHandQuantity ?? 0}</p>
      <input className="input" type="number" min="1" placeholder="Received quantity" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} />
      <input className="input" placeholder="Reference type" value={form.referenceType} onChange={(event) => setForm({ ...form, referenceType: event.target.value })} />
      <textarea className="input min-h-24" placeholder="Receipt notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
      {error && <p className="text-sm text-red-700">{error}</p>}
      {mutation.isError && <p className="text-sm text-red-700">{mutation.error?.response?.data?.error?.message || 'Receipt failed.'}</p>}
      {mutation.isSuccess && <p className="text-sm text-green-700">Receipt saved.</p>}
      <button className="btn-primary" disabled={mutation.isPending}>{mutation.isPending ? 'Saving...' : 'Record receipt'}</button>
    </form>
  );
}
