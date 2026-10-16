import * as service from './contact.service.js';
import { contactCreateSchema, contactUpdateSchema, listContactSchema, messageIdSchema } from './contact.validation.js';
import { ok, validate } from '../carts/carts.utils.js';

export async function create(req, res) {
  ok(res.status(201), 'Contact message submitted.', { message: await service.create(validate(contactCreateSchema, req.body), req.user?.id ?? null) });
}
export async function mine(req, res) {
  ok(res, 'Contact messages loaded.', { messages: await service.mine(req.user.id) });
}
export async function listAdmin(req, res) {
  ok(res, 'Contact messages loaded.', { messages: await service.listAdmin(validate(listContactSchema, req.query)) });
}
export async function summaryAdmin(req, res) {
  ok(res, 'Contact message summary loaded.', { summary: await service.getAdminSummary() });
}
export async function getAdmin(req, res) {
  const { messageId } = validate(messageIdSchema, req.params);
  ok(res, 'Contact message loaded.', { message: await service.getAdmin(messageId) });
}
export async function updateAdmin(req, res) {
  const { messageId } = validate(messageIdSchema, req.params);
  ok(res, 'Contact message updated.', { message: await service.updateAdmin(messageId, validate(contactUpdateSchema, req.body)) });
}
export async function replyAdmin(req, res) {
  const { messageId } = validate(messageIdSchema, req.params);
  ok(res, 'Contact response recorded.', { message: await service.updateAdmin(messageId, validate(contactUpdateSchema, { ...req.body, status: req.body.status || 'IN_PROGRESS' })) });
}
