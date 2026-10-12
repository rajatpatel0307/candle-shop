import { Check, RotateCcw, X } from 'lucide-react';
import { formatDate } from '../utils/inventoryHelpers.js';

export function StockReservationTable({ reservations = [], loading = false, actions }) {
  return (
    <section className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-stone-100 text-xs uppercase text-stone-600">
            <tr>
              <th className="px-4 py-3">Reservation</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Expires</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation) => (
              <tr key={reservation.InventoryReservationId} className="border-t border-stone-100">
                <td className="max-w-48 truncate px-4 py-3">{reservation.InventoryReservationId}</td>
                <td className="px-4 py-3">{reservation.ProductName || reservation.ProductVariantId}</td>
                <td className="px-4 py-3">{reservation.Quantity}</td>
                <td className="px-4 py-3">{reservation.ReservationStatus}</td>
                <td className="px-4 py-3">{formatDate(reservation.ExpiresAtUtc)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="icon-btn" disabled={reservation.ReservationStatus !== 'ACTIVE'} onClick={() => actions.confirm.mutate({ reservationId: reservation.InventoryReservationId })} aria-label="Confirm reservation">
                      <Check className="h-4 w-4" />
                    </button>
                    <button className="icon-btn" disabled={reservation.ReservationStatus !== 'ACTIVE'} onClick={() => actions.release.mutate(reservation.InventoryReservationId)} aria-label="Release reservation">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && reservations.length === 0 && <tr><td className="px-4 py-6 text-center text-stone-500" colSpan={6}>No reservations found.</td></tr>}
            {loading && <tr><td className="px-4 py-6 text-center text-stone-500" colSpan={6}>Loading reservations...</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="border-t border-stone-200 px-4 py-3">
        <button className="btn-secondary" disabled={actions.expire.isPending} onClick={() => actions.expire.mutate({ limit: 100 })}>
          <RotateCcw className="h-4 w-4" /> Expire old reservations
        </button>
      </div>
    </section>
  );
}
