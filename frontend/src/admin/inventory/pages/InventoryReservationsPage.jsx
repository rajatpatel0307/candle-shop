import { useState } from 'react';
import { StockReservationTable } from '../components/StockReservationTable.jsx';
import { InventoryPagination } from '../components/InventoryPagination.jsx';
import { useInventoryReservations, useReservationMutations } from '../hooks/useInventoryMovements.js';
import { reservationSchema } from '../schemas/inventorySchemas.js';

export function InventoryReservationsPage() {
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ productVariantId: '', quantity: '', expiresInMinutes: 30 });
  const [error, setError] = useState('');
  const query = useInventoryReservations({ page, limit: 25 });
  const actions = useReservationMutations();

  function submit(event) {
    event.preventDefault();
    const parsed = reservationSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Invalid reservation.');
      return;
    }
    setError('');
    actions.create.mutate(parsed.data);
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase text-[#697565]">Reservations</p>
        <h1 className="text-4xl font-semibold">Stock reservations</h1>
      </div>
      <form className="mb-5 grid gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_140px_180px_auto]" onSubmit={submit}>
        <input className="input" placeholder="Product variant id" value={form.productVariantId} onChange={(event) => setForm({ ...form, productVariantId: event.target.value })} />
        <input className="input" type="number" min="1" placeholder="Qty" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} />
        <input className="input" type="number" min="1" max="240" placeholder="Expires in minutes" value={form.expiresInMinutes} onChange={(event) => setForm({ ...form, expiresInMinutes: event.target.value })} />
        <button className="btn-primary" disabled={actions.create.isPending}>Reserve</button>
        {error && <p className="text-sm text-red-700 md:col-span-4">{error}</p>}
        {actions.create.isError && <p className="text-sm text-red-700 md:col-span-4">{actions.create.error?.response?.data?.error?.message || 'Reservation failed.'}</p>}
      </form>
      {query.isError && <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{query.error?.response?.data?.error?.message || 'Could not load reservations.'}</p>}
      <StockReservationTable reservations={query.data?.items || []} loading={query.isLoading} actions={actions} />
      <InventoryPagination pagination={query.data?.pagination} onPageChange={setPage} />
    </main>
  );
}
