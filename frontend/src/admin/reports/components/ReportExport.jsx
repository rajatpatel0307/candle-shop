import { endpoints } from '../../../services/endpoints.js';
export function ReportExport({ type }) { return <a className="btn-secondary" href={`${endpoints.adminReports.report(type)}?format=csv`}>Export CSV</a>; }
