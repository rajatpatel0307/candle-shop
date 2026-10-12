import * as service from './inventory.service.js';
import {
  adjustmentSchema,
  confirmReservationSchema,
  createReservationSchema,
  expireReservationsSchema,
  listInventorySchema,
  listMovementsSchema,
  receiptSchema,
  releaseReservationSchema,
  reorderSchema,
  reservationIdSchema,
  variantIdSchema,
} from './inventory.validation.js';
import { created, ok, validate } from './inventory.utils.js';

export async function listInventory(req, res) {
  ok(res, 'Inventory loaded.', await service.listInventory(validate(listInventorySchema, req.query)));
}

export async function getSummary(req, res) {
  ok(res, 'Inventory summary loaded.', { summary: await service.getSummary() });
}

export async function getLowStock(req, res) {
  ok(res, 'Low-stock inventory loaded.', await service.lowStock(validate(listInventorySchema, req.query)));
}

export async function getOutOfStock(req, res) {
  ok(res, 'Out-of-stock inventory loaded.', await service.outOfStock(validate(listInventorySchema, req.query)));
}

export async function getInventory(req, res) {
  const { productVariantId } = validate(variantIdSchema, req.params);
  ok(res, 'Inventory record loaded.', { item: await service.getInventory(productVariantId) });
}

export async function updateReorder(req, res) {
  const { productVariantId } = validate(variantIdSchema, req.params);
  ok(res, 'Reorder settings updated.', { item: await service.updateReorderSettings(productVariantId, validate(reorderSchema, req.body)) });
}

export async function recordReceipt(req, res) {
  const { productVariantId } = validate(variantIdSchema, req.params);
  created(res, 'Stock receipt recorded.', await service.recordReceipt(productVariantId, validate(receiptSchema, req.body), req.user.id));
}

export async function recordAdjustment(req, res) {
  const { productVariantId } = validate(variantIdSchema, req.params);
  created(res, 'Stock adjustment recorded.', await service.recordAdjustment(productVariantId, validate(adjustmentSchema, req.body), req.user.id));
}

export async function listVariantMovements(req, res) {
  const { productVariantId } = validate(variantIdSchema, req.params);
  ok(res, 'Inventory movements loaded.', await service.listMovements(validate(listMovementsSchema, req.query), productVariantId));
}

export async function listMovements(req, res) {
  ok(res, 'Inventory movements loaded.', await service.listMovements(validate(listMovementsSchema, req.query)));
}

export async function createReservation(req, res) {
  created(res, 'Inventory reservation created.', await service.createReservation(validate(createReservationSchema, req.body), req.user.id));
}

export async function listReservations(req, res) {
  ok(res, 'Inventory reservations loaded.', await service.listReservations(req.query));
}

export async function getReservation(req, res) {
  const { reservationId } = validate(reservationIdSchema, req.params);
  ok(res, 'Inventory reservation loaded.', { reservation: await service.getReservation(reservationId) });
}

export async function releaseReservation(req, res) {
  const { reservationId } = validate(reservationIdSchema, req.params);
  validate(releaseReservationSchema, req.body || {});
  ok(res, 'Inventory reservation released.', await service.releaseReservation(reservationId));
}

export async function confirmReservation(req, res) {
  const { reservationId } = validate(reservationIdSchema, req.params);
  ok(res, 'Inventory reservation confirmed.', await service.confirmReservation(reservationId, validate(confirmReservationSchema, req.body || {}), req.user.id));
}

export async function expireReservations(req, res) {
  const { limit } = validate(expireReservationsSchema, req.body || {});
  ok(res, 'Expired inventory reservations processed.', await service.expireReservations(limit));
}
