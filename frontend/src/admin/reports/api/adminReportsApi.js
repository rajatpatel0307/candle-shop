import { apiClient } from '../../../services/apiClient.js';
import { endpoints } from '../../../services/endpoints.js';
export const adminReportsApi = { report: (type, params) => apiClient.get(endpoints.adminReports.report(type), { params }) };
