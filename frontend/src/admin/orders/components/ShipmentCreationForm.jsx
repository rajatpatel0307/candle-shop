import { useState } from 'react';

export function ShipmentCreationForm({ onSubmit, pending }) {
  const [form, setForm] = useState({ carrierName: '', trackingNumber: '', shippingService: '' });
  const set = (field, value) => setForm({ ...form, [field]: value });
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold">Create shipment</h2>
      <input className="input mt-4" value={form.carrierName} onChange={(event) => set('carrierName', event.target.value)} placeholder="Carrier" />
      <input className="input mt-3" value={form.shippingService} onChange={(event) => set('shippingService', event.target.value)} placeholder="Service" />
      <input className="input mt-3" value={form.trackingNumber} onChange={(event) => set('trackingNumber', event.target.value)} placeholder="Tracking number" />
      <button className="btn-primary mt-3" disabled={pending || form.carrierName.length < 2} onClick={() => onSubmit(form)}>Create shipment</button>
    </section>
  );
}
