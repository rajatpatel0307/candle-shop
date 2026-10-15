import { OrderStatusUpdater } from './OrderStatusUpdater.jsx';
import { OrderCancellationPanel } from './OrderCancellationPanel.jsx';

export function OrderProcessingPanel({ actions, order }) {
  return (
    <div className="grid gap-5">
      <OrderStatusUpdater key={order.OrderStatus} currentStatus={order.OrderStatus} pending={actions.updateStatus.isPending} onSubmit={(payload) => actions.updateStatus.mutate(payload)} />
      {['PENDING_PAYMENT','CONFIRMED','PROCESSING','READY_TO_SHIP','CANCELLATION_REQUESTED'].includes(order.OrderStatus) && <OrderCancellationPanel pending={actions.cancel.isPending} onCancel={(payload) => actions.cancel.mutate(payload)} />}
    </div>
  );
}
