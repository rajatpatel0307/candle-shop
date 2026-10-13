export function EmptyState({ title = 'Nothing here yet.' }) {
  return <section className="rounded-lg border border-stone-200 bg-white p-8 text-center text-stone-500 shadow-sm">{title}</section>;
}
