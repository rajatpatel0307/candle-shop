import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAdjustment,
  createReceipt,
  fetchInventory,
  fetchInventoryItem,
  fetchInventorySummary,
  updateReorder,
} from '../api/inventoryApi.js';

export function useInventory(params = {}) {
  return useQuery({
    queryKey: ['inventory', params],
    queryFn: () => fetchInventory(params),
  });
}

export function useInventorySummary() {
  return useQuery({
    queryKey: ['inventory-summary'],
    queryFn: fetchInventorySummary,
  });
}

export function useInventoryItem(productVariantId) {
  return useQuery({
    queryKey: ['inventory-item', productVariantId],
    queryFn: () => fetchInventoryItem(productVariantId),
    enabled: Boolean(productVariantId),
  });
}

export function useInventoryMutations(productVariantId) {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['inventory'] });
    queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
    queryClient.invalidateQueries({ queryKey: ['inventory-item', productVariantId] });
    queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
  };

  return {
    receipt: useMutation({ mutationFn: (payload) => createReceipt(productVariantId, payload), onSuccess: invalidate }),
    adjustment: useMutation({ mutationFn: (payload) => createAdjustment(productVariantId, payload), onSuccess: invalidate }),
    reorder: useMutation({ mutationFn: (payload) => updateReorder(productVariantId, payload), onSuccess: invalidate }),
  };
}
