export function OrderSearch({ value, onChange }) {
  return <input className="input" value={value || ''} onChange={(event) => onChange(event.target.value)} placeholder="Search order number or customer" />;
}
