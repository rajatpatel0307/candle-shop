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
        <OrderItemsList items={details.items} />
        <OrderTimeline history={details.history} />
        <ShipmentDetails shipments={details.shipments} />
      </div>
      <aside className="grid h-fit gap-5">
        <OrderPriceBreakdown order={details.order} />
        <RefundStatus refunds={details.refunds} />
        <OrderCancellationForm pending={actions.cancel.isPending || actions.requestCancellation.isPending} onSubmit={(payload) => actions.cancel.mutate(payload)} />
      </aside>
    </div>
  );
}
