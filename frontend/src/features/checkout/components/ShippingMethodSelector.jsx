import { Truck } from 'lucide-react';

export function ShippingMethodSelector({ pricing }) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold">Shipping method</h2>
      <div className="mt-4 flex items-center gap-3 rounded-md border border-[#b56b45] p-3">
        <Truck className="h-5 w-5 text-[#b56b45]" />
        <div>
          <p className="font-semibold">Standard delivery</p>
          <p className="text-sm text-stone-600">{pricing?.shipping?.message || 'Calculated from delivery address and order value.'}</p>
        </div>
      </div>
    </section>
  );
}
