import { Link, useParams } from 'react-router-dom';
import { TrackingTimeline } from '../components/TrackingTimeline.jsx';
import { useOrderDetails } from '../hooks/useOrderDetails.js';

export function OrderTrackingPage() {
  const { orderId } = useParams();
  const query = useOrderDetails(orderId);
  const shipments = query.data?.shipments || [];
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link className="text-sm font-semibold text-[#8d5132]" to={`/orders/${orderId}`}>Back to order</Link>
      <h1 className="mt-3 text-4xl font-semibold">Tracking</h1>
      {query.isLoading && <p className="mt-5">Loading tracking...</p>}
      <div className="mt-6 grid gap-5">
        {shipments.length === 0 && <p className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">Tracking is not available yet.</p>}
        {shipments.map((shipment) => <section key={shipment.ShipmentId}><h2 className="mb-3 text-xl font-semibold">{shipment.CarrierName} {shipment.TrackingNumber}</h2><TrackingTimeline events={shipment.trackingEvents || []} /></section>)}
      </div>
    </main>
  );
}
