import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  confirmReservation,
  createReservation,
  expireReservations,
  fetchMovements,
  fetchReservations,
  releaseReservation,
} from '../api/inventoryApi.js';

export function useInventoryMovements(params = {}, productVariantId = null) {
  return useQuery({
    queryKey: ['inventory-movements', productVariantId, params],
    queryFn: () => fetchMovements(params, productVariantId),
  });
}

export function useInventoryReservations(params = {}) {
  return useQuery({
    queryKey: ['inventory-reservations', params],
    queryFn: () => fetchReservations(params),
  });
}

export function useReservationMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['inventory'] });
    queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
    queryClient.invalidateQueries({ queryKey: ['inventory-reservations'] });
    queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
  };

  return {
    create: useMutation({ mutationFn: createReservation, onSuccess: invalidate }),
    release: useMutation({ mutationFn: releaseReservation, onSuccess: invalidate }),
    confirm: useMutation({ mutationFn: ({ reservationId, payload }) => confirmReservation(reservationId, payload), onSuccess: invalidate }),
    expire: useMutation({ mutationFn: expireReservations, onSuccess: invalidate }),
  };
}
