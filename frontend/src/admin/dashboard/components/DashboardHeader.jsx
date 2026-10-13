import { DateRangeFilter } from './DateRangeFilter.jsx';

export function DashboardHeader({ range, onRangeChange }) {
  return <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase text-[#697565]">Admin</p><h1 className="text-4xl font-semibold">Dashboard</h1></div><DateRangeFilter value={range} onChange={onRangeChange} /></div>;
}
