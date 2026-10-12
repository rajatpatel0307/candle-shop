import { apiClient } from '../../../services/apiClient.js';
import { endpoints } from '../../../services/endpoints.js';

export const authApi = {
  register: (payload) => apiClient.post(endpoints.auth.register, payload).then((res) => res.data),
  login: (payload) => apiClient.post(endpoints.auth.login, payload).then((res) => res.data),
  refresh: () => apiClient.post(endpoints.auth.refresh).then((res) => res.data),
  logout: () => apiClient.post(endpoints.auth.logout).then((res) => res.data),
  logoutAll: () => apiClient.post(endpoints.auth.logoutAll).then((res) => res.data),
  me: () => apiClient.get(endpoints.auth.me).then((res) => res.data),
  verifyEmail: (token) => apiClient.post(endpoints.auth.verifyEmail, { token }).then((res) => res.data),
  resendVerification: (email) => apiClient.post(endpoints.auth.resendVerification, { email }).then((res) => res.data),
  forgotPassword: (email) => apiClient.post(endpoints.auth.forgotPassword, { email }).then((res) => res.data),
  resetPassword: (payload) => apiClient.post(endpoints.auth.resetPassword, payload).then((res) => res.data),
  changePassword: (payload) => apiClient.post(endpoints.auth.changePassword, payload).then((res) => res.data),
  sessions: () => apiClient.get(endpoints.auth.sessions).then((res) => res.data),
  revokeSession: (sessionId) => apiClient.delete(endpoints.auth.session(sessionId)).then((res) => res.data),
};
