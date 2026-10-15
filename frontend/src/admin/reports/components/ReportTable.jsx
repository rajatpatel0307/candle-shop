const label = (key) => key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ');
const value = (key, entry) => {
  if (entry == null) return '--';
  if (/AtUtc$|^Date$|^Day$/.test(key)) return new Date(entry).toLocaleDateString('en-IN');
  if (typeof entry === 'number') return entry.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  return String(entry);
};
export function ReportTable({ rows = [] }) {
  const columns = Object.keys(rows[0] || {});
  return <section className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm"><table className="w-full min-w-[760px] text-left text-sm"><thead><tr>{columns.map((column) => <th key={column}>{label(column)}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index} className="border-t border-stone-100">{columns.map((column) => <td key={column} className="max-w-xs break-words" title={String(row[column] ?? '')}>{value(column, row[column])}</td>)}</tr>)}</tbody></table></section>;
}
