import { Link } from 'react-router-dom';
import { OrderStatusBadge } from './OrderStatusBadge.jsx';

export function ShipmentDetails({ shipments = [] }) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold">Shipments</h2>
      {shipments.length === 0 ? <p className="mt-3 text-sm text-stone-500">No shipments yet.</p> : shipments.map((shipment) => (
        <div key={shipment.ShipmentId} className="mt-3 rounded-md border border-stone-200 p-3 text-sm">
          <div className="flex justify-between gap-3"><strong>{shipment.CarrierName}</strong><OrderStatusBadge status={shipment.ShipmentStatus} /></div>
          <p className="mt-1 text-stone-500">{shipment.TrackingNumber || 'Tracking pending'}</p>
          {shipment.TrackingUrl && <a className="text-[#8d5132] underline" href={shipment.TrackingUrl} target="_blank" rel="noreferrer">Carrier tracking</a>}
        </div>
      ))}
    </section>
  );
}
