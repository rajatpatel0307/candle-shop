import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminReportsApi } from '../api/adminReportsApi.js';
import { ReportExport } from '../components/ReportExport.jsx';
import { ReportFilters } from '../components/ReportFilters.jsx';
import { ReportTable } from '../components/ReportTable.jsx';
export function AdminReportsPage() { const [type, setType] = useState('sales'); const q = useQuery({ queryKey: ['admin-report', type], queryFn: async () => (await adminReportsApi.report(type, { range: 'last30' })).data.data.report.rows }); return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><h1 className="text-4xl font-semibold">Reports</h1><div className="mt-6 flex flex-wrap justify-between gap-3"><ReportFilters type={type} onType={setType} /><ReportExport type={type} /></div><div className="mt-5"><ReportTable rows={q.data || []} /></div></main>; }
