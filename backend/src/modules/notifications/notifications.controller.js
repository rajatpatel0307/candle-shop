import * as service from './notifications.service.js';
import { announcementSchema, listNotificationsSchema, notificationIdSchema } from './notifications.validation.js';
import { ok, validate } from '../carts/carts.utils.js';

export async function list(req, res) {
  ok(res, 'Notifications loaded.', { notifications: await service.list(req.user.id, validate(listNotificationsSchema, req.query)) });
}
export async function unreadCount(req, res) {
  ok(res, 'Unread count loaded.', { unread: await service.unreadCount(req.user.id) });
}
export async function markRead(req, res) {
  const { notificationId } = validate(notificationIdSchema, req.params);
  ok(res, 'Notification marked read.', { notification: await service.markRead(req.user.id, notificationId) });
}
export async function markAllRead(req, res) {
  ok(res, 'Notifications marked read.', { result: await service.markAllRead(req.user.id) });
}
export async function listAdmin(req, res) {
  ok(res, 'Admin notifications loaded.', { notifications: await service.listAdmin(validate(listNotificationsSchema, req.query)) });
}
export async function announce(req, res) {
  ok(res.status(201), 'Announcement sent.', { notification: await service.announce(validate(announcementSchema, req.body)) });
}
