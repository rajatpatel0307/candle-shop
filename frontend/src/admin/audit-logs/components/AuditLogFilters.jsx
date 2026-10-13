export function AuditLogFilters({ search, onSearch }) { return <input className="input" value={search || ''} onChange={(e) => onSearch(e.target.value)} placeholder="Search activity" />; }
