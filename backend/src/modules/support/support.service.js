import { AppError } from '../../common/errors/AppError.js';
import * as notifications from '../notifications/notifications.service.js';
import { ticketReplyNotification } from '../notifications/notifications.factory.js';
import * as repo from './support.repository.js';

const transitions = {
  OPEN: ['IN_PROGRESS', 'CLOSED'],
  IN_PROGRESS: ['WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED'],
  WAITING_FOR_CUSTOMER: ['IN_PROGRESS', 'RESOLVED', 'CLOSED'],
  RESOLVED: ['IN_PROGRESS', 'CLOSED'],
  CLOSED: [],
};

function assertTransition(from, to) {
  if (!to || from === to) return;
  if (!(transitions[from] || []).includes(to)) throw new AppError(409, 'INVALID_TICKET_STATUS_TRANSITION', `Cannot move ticket from ${from} to ${to}.`);
}

export async function create(userId, input) {
  return repo.createTicket({ userId, input });
}
export async function mine(userId, query) {
  const result = await repo.listMine(userId, query);
  return { items: result.rows, pagination: { page: query.page, limit: query.limit, total: result.total } };
}
export async function adminList(query) {
  const result = await repo.listAdmin(query);
  return { items: result.rows, pagination: { page: query.page, limit: query.limit, total: result.total } };
}
export async function getMine(userId, ticketId) {
  const details = await repo.getTicket(ticketId, userId, false);
  if (!details) throw new AppError(404, 'TICKET_NOT_FOUND', 'Ticket was not found.');
  return details;
}
export async function getAdmin(ticketId) {
  const details = await repo.getTicket(ticketId, null, true);
  if (!details) throw new AppError(404, 'TICKET_NOT_FOUND', 'Ticket was not found.');
  return details;
}
export async function customerReply(userId, ticketId, input) {
  const details = await getMine(userId, ticketId);
  if (['CLOSED'].includes(details.ticket.TicketStatus)) throw new AppError(409, 'TICKET_CLOSED', 'Closed tickets cannot be updated.');
  return repo.addMessage({ ticketId, senderUserId: userId, message: input.message, isInternalNote: false });
}
export async function adminReply(userId, ticketId, input) {
  const details = await getAdmin(ticketId);
  const message = await repo.addMessage({ ticketId, senderUserId: userId, message: input.message, isInternalNote: input.isInternalNote });
  if (!input.isInternalNote) await notifications.createNotification(ticketReplyNotification(details.ticket));
  return message;
}
export async function updateAdmin(ticketId, input) {
  const details = await getAdmin(ticketId);
  assertTransition(details.ticket.TicketStatus, input.status);
  const ticket = await repo.updateTicket(ticketId, input);
  if (input.status) await notifications.createNotification(ticketReplyNotification(ticket, `Your ticket status changed to ${input.status}.`));
  return ticket;
}
export async function customerStatus(userId, ticketId, input) {
  const details = await getMine(userId, ticketId);
  if (!['RESOLVED', 'CLOSED', 'IN_PROGRESS'].includes(input.status)) throw new AppError(403, 'STATUS_NOT_ALLOWED', 'This status change is not available to customers.');
  assertTransition(details.ticket.TicketStatus, input.status);
  return repo.updateTicket(ticketId, { status: input.status });
}
