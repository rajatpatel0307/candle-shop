import { apiClient } from '../../../services/apiClient.js';
import { endpoints } from '../../../services/endpoints.js';
export const auditLogsApi = { list: (params) => apiClient.get(endpoints.auditLogs.root, { params }), detail: (id) => apiClient.get(endpoints.auditLogs.detail(id)) };
