import { Link, useParams } from 'react-router-dom';
import { OrderItemsList } from '../../../features/orders/components/OrderItemsList.jsx';
import { OrderPriceBreakdown } from '../../../features/orders/components/OrderPriceBreakdown.jsx';
import { RefundManagementPanel } from '../components/RefundManagementPanel.jsx';
import { ShipmentCreationForm } from '../components/ShipmentCreationForm.jsx';
import { ShipmentTrackingPanel } from '../components/ShipmentTrackingPanel.jsx';
import { OrderAuditHistory } from '../components/OrderAuditHistory.jsx';
import { OrderProcessingPanel } from '../components/OrderProcessingPanel.jsx';
import { useAdminOrder, useAdminOrderActions } from '../hooks/useAdminOrders.js';

export function AdminOrderDetailsPage() {
  const { orderId } = useParams();
  const query = useAdminOrder(orderId);
  const actions = useAdminOrderActions(orderId);
  const details = query.data;
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Link className="text-sm font-semibold text-[#8d5132]" to="/admin/orders">Back to admin orders</Link>
      <h1 className="mt-3 text-4xl font-semibold">{details?.order?.OrderNumber || 'Order'}</h1>
      {query.isLoading && <p className="mt-5">Loading order...</p>}
      {details && (
        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-5">
            <OrderItemsList items={details.items} />
            <OrderAuditHistory history={details.history} />
            <ShipmentTrackingPanel shipments={details.shipments} onDispatch={(id) => actions.dispatchShipment.mutate(id)} />
          </div>
          <aside className="grid h-fit gap-5">
            <OrderPriceBreakdown order={details.order} />
            <OrderProcessingPanel actions={actions} />
            <ShipmentCreationForm pending={actions.createShipment.isPending} onSubmit={(payload) => actions.createShipment.mutate(payload)} />
            <RefundManagementPanel
              refunds={details.refunds}
              pending={actions.createRefund.isPending}
              onCreate={(payload) => actions.createRefund.mutate(payload)}
              onApprove={(refundId) => actions.approveRefund.mutate(refundId)}
            />
          </aside>
        </div>
      )}
    </main>
  );
}
