import { AppError } from '../../common/errors/AppError.js';
import * as repo from './notifications.repository.js';

export async function createNotification(input) {
  return repo.create(input);
}

export async function list(userId, query) {
  const result = await repo.listForUser(userId, query);
  return { items: result.rows, pagination: { page: query.page, limit: query.limit, total: result.total } };
}

export async function unreadCount(userId) {
  return { count: await repo.unreadCount(userId) };
}

export async function markRead(userId, notificationId) {
  const item = await repo.markRead({ userId, notificationId });
  if (!item) throw new AppError(404, 'NOTIFICATION_NOT_FOUND', 'Notification was not found.');
  return item;
}

export async function markAllRead(userId) {
  return { updated: await repo.markAllRead(userId) };
}

export async function listAdmin(query) {
  const result = await repo.listAdmin(query);
  return { items: result.rows, pagination: { page: query.page, limit: query.limit, total: result.total } };
}

export async function announce(input) {
  if (!input.userId) throw new AppError(400, 'RECIPIENT_REQUIRED', 'A recipient userId is required for announcements.');
  return repo.create({ userId: input.userId, title: input.title, message: input.message, type: input.type });
}
