import { apiClient } from '../../services/apiClient.js';
export const notificationsApi = {
  list: (params) => apiClient.get('/notifications', {params}),
  unread: () => apiClient.get('/notifications/unread-count'),
  markRead: (id) => apiClient.patch(`/notifications/${id}/read`),
  markAllRead: () => apiClient.patch('/notifications/read-all'),
};
