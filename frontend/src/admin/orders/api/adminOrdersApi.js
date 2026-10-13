import { apiClient } from '../../../services/apiClient.js';
import { endpoints } from '../../../services/endpoints.js';

export const adminOrdersApi = {
  list: (params) => apiClient.get(endpoints.adminOrders.root, { params }),
  detail: (orderId) => apiClient.get(endpoints.adminOrders.detail(orderId)),
  updateStatus: (orderId, payload) => apiClient.patch(endpoints.adminOrders.status(orderId), payload),
  cancel: (orderId, payload) => apiClient.post(endpoints.adminOrders.cancel(orderId), payload),
  history: (orderId) => apiClient.get(endpoints.adminOrders.history(orderId)),
  cancellations: (orderId) => apiClient.get(endpoints.adminOrders.cancellations(orderId)),
  createShipment: (orderId, payload) => apiClient.post(endpoints.shipping.orderShipments(orderId), payload),
  dispatchShipment: (shipmentId) => apiClient.post(endpoints.shipping.dispatch(shipmentId)),
  addTrackingEvent: (shipmentId, payload) => apiClient.post(endpoints.shipping.trackingEvents(shipmentId), payload),
  refunds: () => apiClient.get(endpoints.refunds.admin),
  createRefund: (orderId, payload) => apiClient.post(endpoints.refunds.order(orderId), payload),
  approveRefund: (refundId) => apiClient.post(endpoints.refunds.approve(refundId), {}),
};
