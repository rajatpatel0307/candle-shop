import { useAdminOrders } from '../hooks/useAdminOrders.js';

export function AdminShipmentsPage() {
  const query = useAdminOrders({ status: 'SHIPPED' });
  return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><h1 className="text-4xl font-semibold">Shipments</h1><p className="mt-3 text-stone-600">Shipment work is managed from each order detail page.</p><p className="mt-5 text-sm">Shipped orders: {query.data?.pagination?.total || 0}</p></main>;
}
