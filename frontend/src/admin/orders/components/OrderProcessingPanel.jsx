import { OrderStatusUpdater } from './OrderStatusUpdater.jsx';
import { OrderCancellationPanel } from './OrderCancellationPanel.jsx';

export function OrderProcessingPanel({ actions }) {
  return (
    <div className="grid gap-5">
      <OrderStatusUpdater pending={actions.updateStatus.isPending} onSubmit={(payload) => actions.updateStatus.mutate(payload)} />
      <OrderCancellationPanel pending={actions.cancel.isPending} onCancel={(payload) => actions.cancel.mutate(payload)} />
    </div>
  );
}
