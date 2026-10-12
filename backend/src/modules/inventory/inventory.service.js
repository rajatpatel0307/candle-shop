import { AppError } from '../../common/errors/AppError.js';
import { DEFAULT_RESERVATION_MINUTES, RESERVATION_STATUS } from './inventory.constants.js';
import * as repo from './inventory.repository.js';
import { addMinutes, toOffset } from './inventory.utils.js';

function paginate(input) {
  return { ...input, offset: toOffset(input.page, input.limit) };
}

export async function listInventory(query) {
  const filters = paginate(query);
  const result = await repo.listInventory(filters);
  return {
    items: result.rows,
    pagination: { page: query.page, limit: query.limit, total: result.total },
  };
}

export async function getInventory(productVariantId) {
  const item = await repo.getInventory(productVariantId);
  if (!item) throw new AppError(404, 'INVENTORY_NOT_FOUND', 'Inventory record was not found.');
  return item;
}

export async function getSummary() {
  return repo.getSummary();
}

export async function lowStock(query) {
  return listInventory({ ...query, status: 'low-stock' });
}

export async function outOfStock(query) {
  return listInventory({ ...query, status: 'out-of-stock' });
}

export async function updateReorderSettings(productVariantId, body) {
  const updated = await repo.updateReorderSettings({ productVariantId, ...body });
  if (!updated) throw new AppError(404, 'INVENTORY_NOT_FOUND', 'Inventory record was not found.');
  return getInventory(productVariantId);
}

export async function recordReceipt(productVariantId, body, userId) {
  const result = await repo.recordReceipt({ productVariantId, ...body, userId });
  if (!result) throw new AppError(404, 'INVENTORY_NOT_FOUND', 'Inventory record was not found.');
  return result;
}

export async function recordAdjustment(productVariantId, body, userId) {
  const result = await repo.recordAdjustment({ productVariantId, ...body, userId });
  if (!result) throw new AppError(404, 'INVENTORY_NOT_FOUND', 'Inventory record was not found.');
  if (result.insufficientStock) {
    throw new AppError(409, 'INSUFFICIENT_UNRESERVED_STOCK', 'Adjustment would reduce stock below the reserved quantity.', {
      reservedQuantity: result.reserved,
    });
  }
  return result;
}

export async function listMovements(query, productVariantId = null) {
  const filters = paginate(query);
  const result = await repo.listMovements({ ...filters, productVariantId });
  return {
    items: result.rows,
    pagination: { page: query.page, limit: query.limit, total: result.total },
  };
}

export async function createReservation(body, userId) {
  const expiresAt = addMinutes(new Date(), body.expiresInMinutes || DEFAULT_RESERVATION_MINUTES);
  const result = await repo.createReservation({ ...body, expiresAt, userId });
  if (result.insufficientStock) throw new AppError(409, 'INSUFFICIENT_STOCK', 'Not enough available stock to reserve.');
  return result;
}

export async function listReservations(query) {
  const page = query.page || 1;
  const limit = Math.min(query.limit || 20, 100);
  const result = await repo.listReservations({
    status: query.status,
    limit,
    offset: toOffset(page, limit),
  });
  return { items: result.rows, pagination: { page, limit, total: result.total } };
}

export async function getReservation(reservationId) {
  const reservation = await repo.getReservation(reservationId);
  if (!reservation) throw new AppError(404, 'RESERVATION_NOT_FOUND', 'Inventory reservation was not found.');
  return reservation;
}

export async function releaseReservation(reservationId) {
  const result = await repo.releaseReservation(reservationId, RESERVATION_STATUS.RELEASED);
  if (!result) throw new AppError(404, 'RESERVATION_NOT_FOUND', 'Inventory reservation was not found.');
  return result;
}

export async function confirmReservation(reservationId, body, userId) {
  const result = await repo.confirmReservation(reservationId, body.orderId, userId);
  if (!result) throw new AppError(404, 'RESERVATION_NOT_FOUND', 'Inventory reservation was not found.');
  if (result.expired) throw new AppError(409, 'RESERVATION_EXPIRED', 'Reservation is expired and cannot be confirmed.');
  if (result.insufficientStock) throw new AppError(409, 'INSUFFICIENT_STOCK', 'Stock is no longer available for this reservation.');
  return result;
}

export async function expireReservations(limit) {
  const expired = await repo.expireReservations(limit);
  return { expiredCount: expired.length, reservations: expired };
}
