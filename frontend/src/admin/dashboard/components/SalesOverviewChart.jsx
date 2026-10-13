export function SalesOverviewChart({ data = [], title = 'Sales overview' }) {
  const max = Math.max(...data.map((item) => Number(item.Value || 0)), 1);
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-4 flex h-44 items-end gap-2">
        {data.map((item) => <div key={String(item.Bucket)} className="flex flex-1 flex-col items-center gap-2"><div className="w-full rounded-t bg-[#b56b45]" style={{ height: `${Math.max(4, (Number(item.Value || 0) / max) * 150)}px` }} /><span className="max-w-16 truncate text-[10px] text-stone-500">{String(item.Bucket).slice(5, 10)}</span></div>)}
      </div>
    </section>
  );
}
