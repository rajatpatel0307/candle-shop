export function MetricCard({ label, value, sublabel }) {
  return <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm"><p className="text-sm font-semibold text-stone-500">{label}</p><p className="mt-2 text-2xl font-semibold">{value ?? 0}</p>{sublabel && <p className="mt-1 text-xs text-stone-500">{sublabel}</p>}</section>;
}
