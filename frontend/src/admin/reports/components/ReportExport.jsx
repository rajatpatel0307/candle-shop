import { useState } from 'react';
import { Download } from 'lucide-react';
import { apiClient } from '../../../services/apiClient.js';
import { endpoints } from '../../../services/endpoints.js';
export function ReportExport({ type, params, disabled }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const download = async () => {
    setPending(true); setError('');
    try {
      const response = await apiClient.get(endpoints.adminReports.report(type), { params: { ...params, format: 'csv' }, responseType: 'blob' });
      const url = URL.createObjectURL(new Blob(['\uFEFF', response.data], { type: 'text/csv;charset=utf-8;' }));
      const link = document.createElement('a'); link.href = url; link.download = `${type}-report-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch { setError('Export failed. Please try again.'); } finally { setPending(false); }
  };
  return <div><button type="button" className="btn-primary" disabled={disabled || pending} onClick={download}><Download className="h-4 w-4" />{pending ? 'Exporting...' : 'Export CSV'}</button>{error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}</div>;
}
