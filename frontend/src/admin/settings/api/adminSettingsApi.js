import { apiClient } from '../../../services/apiClient.js';
import { endpoints } from '../../../services/endpoints.js';
export const adminSettingsApi = { list: () => apiClient.get(endpoints.adminSettings.root), update: (key, payload) => apiClient.put(endpoints.adminSettings.detail(key), payload) };
