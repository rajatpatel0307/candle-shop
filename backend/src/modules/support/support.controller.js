import * as service from './support.service.js';
import { listTicketsSchema, ticketCreateSchema, ticketIdSchema, ticketMessageSchema, ticketUpdateSchema } from './support.validation.js';
import { ok, validate } from '../carts/carts.utils.js';

export async function create(req, res) {
  ok(res.status(201), 'Support ticket created.', { ticket: await service.create(req.user.id, validate(ticketCreateSchema, req.body)) });
}
export async function mine(req, res) {
  ok(res, 'Support tickets loaded.', { tickets: await service.mine(req.user.id, validate(listTicketsSchema, req.query)) });
}
export async function detail(req, res) {
  const { ticketId } = validate(ticketIdSchema, req.params);
  ok(res, 'Support ticket loaded.', { ticket: await service.getMine(req.user.id, ticketId) });
}
export async function reply(req, res) {
  const { ticketId } = validate(ticketIdSchema, req.params);
  ok(res.status(201), 'Support reply added.', { message: await service.customerReply(req.user.id, ticketId, validate(ticketMessageSchema.omit({ isInternalNote: true }), req.body)) });
}
export async function customerStatus(req, res) {
  const { ticketId } = validate(ticketIdSchema, req.params);
  ok(res, 'Ticket status updated.', { ticket: await service.customerStatus(req.user.id, ticketId, validate(ticketUpdateSchema.pick({ status: true }), req.body)) });
}
export async function adminList(req, res) {
  ok(res, 'Admin tickets loaded.', { tickets: await service.adminList(validate(listTicketsSchema, req.query)) });
}
export async function adminDetail(req, res) {
  const { ticketId } = validate(ticketIdSchema, req.params);
  ok(res, 'Admin ticket loaded.', { ticket: await service.getAdmin(ticketId) });
}
export async function adminReply(req, res) {
  const { ticketId } = validate(ticketIdSchema, req.params);
  ok(res.status(201), 'Admin reply added.', { message: await service.adminReply(req.user.id, ticketId, validate(ticketMessageSchema, req.body)) });
}
export async function adminUpdate(req, res) {
  const { ticketId } = validate(ticketIdSchema, req.params);
  ok(res, 'Ticket updated.', { ticket: await service.updateAdmin(ticketId, validate(ticketUpdateSchema, req.body)) });
}
