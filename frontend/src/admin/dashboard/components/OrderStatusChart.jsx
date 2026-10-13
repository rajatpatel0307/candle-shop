export function OrderStatusChart({ data = [] }) {
  const total = data.reduce((sum, item) => sum + Number(item.Count || 0), 0) || 1;
  return <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm"><h2 className="text-xl font-semibold">Order statuses</h2><div className="mt-4 space-y-3">{data.map((item) => <div key={item.Status}><div className="flex justify-between text-sm"><span>{item.Status}</span><span>{item.Count}</span></div><div className="mt-1 h-2 rounded bg-stone-100"><div className="h-2 rounded bg-[#697565]" style={{ width: `${(Number(item.Count) / total) * 100}%` }} /></div></div>)}</div></section>;
}
