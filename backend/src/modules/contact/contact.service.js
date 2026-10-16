import { AppError } from '../../common/errors/AppError.js';
import * as notifications from '../notifications/notifications.service.js';
import * as repo from './contact.repository.js';

export async function create(input, userId = null) {
  return repo.createMessage(input, userId);
}
export async function mine(userId) {
  return repo.listMine(userId);
}
export async function getAdminSummary() {
  return repo.getAdminSummary();
}
export async function listAdmin(query) {
  const result = await repo.listAdmin(query);
  return { items: result.rows, pagination: { page: query.page, limit: query.limit, total: result.total } };
}
export async function getAdmin(messageId) {
  const item = await repo.getMessage(messageId);
  if (!item) throw new AppError(404, 'CONTACT_MESSAGE_NOT_FOUND', 'Contact message was not found.');
  return item;
}
export async function updateAdmin(messageId, input) {
  const item = await repo.updateMessage(messageId, input);
  if (!item) throw new AppError(404, 'CONTACT_MESSAGE_NOT_FOUND', 'Contact message was not found.');
  if (item.UserId && (input.status || input.adminResponse)) {
    await notifications.createNotification({
      userId: item.UserId,
      title: 'Contact message updated',
      message: `Your message "${item.Subject}" was updated.`,
      type: 'CONTACT',
      relatedEntityType: 'ContactMessage',
      relatedEntityId: item.ContactMessageId,
    });
  }
  return item;
}
