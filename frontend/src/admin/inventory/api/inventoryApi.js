import { apiClient } from '../../../services/apiClient.js';
import { endpoints } from '../../../services/endpoints.js';

export async function fetchInventory(params = {}) {
  return (await apiClient.get(endpoints.inventory.list, { params })).data.data;
}

export async function fetchInventorySummary() {
  return (await apiClient.get(endpoints.inventory.summary)).data.data.summary;
}

export async function fetchInventoryItem(productVariantId) {
  return (await apiClient.get(endpoints.inventory.detail(productVariantId))).data.data.item;
}

export async function updateReorder(productVariantId, payload) {
  return (await apiClient.patch(endpoints.inventory.reorder(productVariantId), payload)).data.data.item;
}

export async function createReceipt(productVariantId, payload) {
  return (await apiClient.post(endpoints.inventory.receipts(productVariantId), payload)).data.data;
}

export async function createAdjustment(productVariantId, payload) {
  return (await apiClient.post(endpoints.inventory.adjustments(productVariantId), payload)).data.data;
}

export async function fetchMovements(params = {}, productVariantId = null) {
  const url = productVariantId ? endpoints.inventory.variantMovements(productVariantId) : endpoints.inventory.movements;
  return (await apiClient.get(url, { params })).data.data;
}

export async function fetchReservations(params = {}) {
  return (await apiClient.get(endpoints.inventory.reservations, { params })).data.data;
}

export async function createReservation(payload) {
  return (await apiClient.post(endpoints.inventory.reservations, payload)).data.data;
}

export async function releaseReservation(reservationId) {
  return (await apiClient.post(endpoints.inventory.releaseReservation(reservationId))).data.data;
}

export async function confirmReservation(reservationId, payload = {}) {
  return (await apiClient.post(endpoints.inventory.confirmReservation(reservationId), payload)).data.data;
}

export async function expireReservations(payload = {}) {
  return (await apiClient.post(endpoints.inventory.expireReservations, payload)).data.data;
}
