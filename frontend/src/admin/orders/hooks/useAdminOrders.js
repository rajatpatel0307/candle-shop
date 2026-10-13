import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminOrdersApi } from '../api/adminOrdersApi.js';

export function useAdminOrders(params = {}) {
  return useQuery({ queryKey: ['admin-orders', params], queryFn: async () => (await adminOrdersApi.list(params)).data.data.orders });
}

export function useAdminOrder(orderId) {
  return useQuery({ queryKey: ['admin-order', orderId], enabled: Boolean(orderId), queryFn: async () => (await adminOrdersApi.detail(orderId)).data.data.order });
}

export function useAdminOrderActions(orderId) {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    queryClient.invalidateQueries({ queryKey: ['admin-order', orderId] });
  };
  return {
    updateStatus: useMutation({ mutationFn: (payload) => adminOrdersApi.updateStatus(orderId, payload), onSuccess: invalidate }),
    cancel: useMutation({ mutationFn: (payload) => adminOrdersApi.cancel(orderId, payload), onSuccess: invalidate }),
    createShipment: useMutation({ mutationFn: (payload) => adminOrdersApi.createShipment(orderId, payload), onSuccess: invalidate }),
    createRefund: useMutation({ mutationFn: (payload) => adminOrdersApi.createRefund(orderId, payload), onSuccess: invalidate }),
    dispatchShipment: useMutation({ mutationFn: adminOrdersApi.dispatchShipment, onSuccess: invalidate }),
    addTrackingEvent: useMutation({ mutationFn: ({ shipmentId, payload }) => adminOrdersApi.addTrackingEvent(shipmentId, payload), onSuccess: invalidate }),
    approveRefund: useMutation({ mutationFn: adminOrdersApi.approveRefund, onSuccess: invalidate }),
  };
}

export function useAdminRefunds() {
  return useQuery({ queryKey: ['admin-refunds'], queryFn: async () => (await adminOrdersApi.refunds()).data.data.refunds });
}
