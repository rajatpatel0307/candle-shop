import { Link, useParams } from 'react-router-dom';
import { TrackingTimeline } from '../components/TrackingTimeline.jsx';
import { useOrderDetails } from '../hooks/useOrderDetails.js';

export function OrderTrackingPage() {
  const { orderId } = useParams();
  const query = useOrderDetails(orderId);
  const shipments = query.data?.shipments || [];
  return (
    <main>
      <Link className="text-sm font-semibold text-[#8d5132]" to={`/orders/${orderId}`}>Back to order</Link>
      <h1 className="mt-3 text-3xl font-semibold">Order tracking</h1>
      {query.isLoading && <p className="mt-5">Loading tracking...</p>}
      {query.isError && <p role="alert" className="mt-5 rounded-md bg-red-50 p-3 text-sm text-red-700">Could not load tracking. <button className="underline" onClick={() => query.refetch()}>Try again</button></p>}
      <div className="mt-6 grid gap-5">
        {query.isSuccess && shipments.length === 0 && <p className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">Tracking will appear here once your order is shipped.</p>}
        {shipments.map((shipment) => <section key={shipment.ShipmentId}><h2 className="mb-3 text-xl font-semibold">{shipment.CarrierName} {shipment.TrackingNumber}</h2><TrackingTimeline events={shipment.trackingEvents || []} /></section>)}
      </div>
    </main>
  );
}
