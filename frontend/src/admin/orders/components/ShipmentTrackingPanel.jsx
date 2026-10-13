export function ShipmentTrackingPanel({ shipments = [], onDispatch }) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold">Shipments</h2>
      {shipments.map((shipment) => (
        <div key={shipment.ShipmentId} className="mt-3 rounded-md border border-stone-200 p-3 text-sm">
          <strong>{shipment.ShipmentNumber}</strong><p>{shipment.CarrierName} {shipment.TrackingNumber} {shipment.ShipmentStatus}</p>
          <button className="mt-2 text-[#8d5132] underline" onClick={() => onDispatch(shipment.ShipmentId)}>Dispatch</button>
        </div>
      ))}
    </section>
  );
}
