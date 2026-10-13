import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditLogsApi } from '../api/auditLogsApi.js';
import { AuditLogFilters } from '../components/AuditLogFilters.jsx';
import { AuditLogsTable } from '../components/AuditLogsTable.jsx';
export function AdminAuditLogsPage() { const [search, setSearch] = useState(''); const q = useQuery({ queryKey: ['audit-logs', search], queryFn: async () => (await auditLogsApi.list({ search })).data.data.auditLogs }); return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><h1 className="text-4xl font-semibold">Audit logs</h1><div className="mt-6 grid gap-4"><AuditLogFilters search={search} onSearch={setSearch} /><AuditLogsTable rows={q.data?.items || []} /></div></main>; }
