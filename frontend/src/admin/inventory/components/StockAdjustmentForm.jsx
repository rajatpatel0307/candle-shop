import { useState } from 'react';
import { adjustmentSchema } from '../schemas/inventorySchemas.js';

export function StockAdjustmentForm({ item, mutation }) {
  const [form, setForm] = useState({ type: 'IN', quantity: '', reason: '' });
  const [error, setError] = useState('');
  const projected = Number(item?.OnHandQuantity || 0) + (form.type === 'IN' ? Number(form.quantity || 0) : -Number(form.quantity || 0));

  function submit(event) {
    event.preventDefault();
    const parsed = adjustmentSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Invalid adjustment.');
      return;
    }
    setError('');
    mutation.mutate(parsed.data);
  }

  return (
    <form className="grid gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-sm" onSubmit={submit}>
      <h2 className="text-lg font-semibold">Manual adjustment</h2>
      <p className="text-sm text-stone-500">Reserved stock: {item?.ReservedQuantity ?? 0} | Projected physical stock: {projected}</p>
      <select className="input" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
        <option value="IN">Increase stock</option>
        <option value="OUT">Decrease stock</option>
      </select>
      <input className="input" type="number" min="1" placeholder="Quantity" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} />
      <textarea className="input min-h-24" placeholder="Required reason" value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} />
      {error && <p className="text-sm text-red-700">{error}</p>}
      {mutation.isError && <p className="text-sm text-red-700">{mutation.error?.response?.data?.error?.message || 'Adjustment failed.'}</p>}
      {mutation.isSuccess && <p className="text-sm text-green-700">Adjustment saved.</p>}
      <button className="btn-primary" disabled={mutation.isPending}>{mutation.isPending ? 'Saving...' : 'Record adjustment'}</button>
    </form>
  );
}
