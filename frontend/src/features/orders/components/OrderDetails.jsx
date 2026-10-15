import { OrderCancellationForm } from './OrderCancellationForm.jsx';
import { OrderItemsList } from './OrderItemsList.jsx';
import { OrderPriceBreakdown } from './OrderPriceBreakdown.jsx';
import { OrderTimeline } from './OrderTimeline.jsx';
import { RefundStatus } from './RefundStatus.jsx';
import { ShipmentDetails } from './ShipmentDetails.jsx';

export function OrderDetails({ details, actions }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <div className="grid gap-5">
        {details.addresses?.map((address) => <section key={address.OrderAddressId} className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-semibold">{address.AddressType?.toUpperCase() === 'SHIPPING' ? 'Delivery address' : 'Billing address'}</h2><p className="mt-3 text-sm font-semibold">{address.RecipientName}</p><p className="mt-1 text-sm leading-6 text-stone-600">{[address.AddressLine1, address.AddressLine2, address.Locality, address.City, address.StateOrProvince, address.PostalCode].filter(Boolean).join(', ')}</p><p className="mt-2 text-sm text-stone-600">{address.PhoneNumber}</p></section>)}
        <OrderItemsList items={details.items} order={details.order} />
        <OrderTimeline history={details.history} />
        <ShipmentDetails shipments={details.shipments} />
      </div>
      <aside className="grid h-fit gap-5">
        <OrderPriceBreakdown order={details.order} />
        <RefundStatus refunds={details.refunds} />
        {['PENDING_PAYMENT', 'CONFIRMED', 'PROCESSING', 'READY_TO_SHIP'].includes(details.order?.OrderStatus) && <OrderCancellationForm pending={actions.cancel.isPending || actions.requestCancellation.isPending} onSubmit={(payload) => actions.cancel.mutate(payload)} />}
      </aside>
    </div>
  );
}
