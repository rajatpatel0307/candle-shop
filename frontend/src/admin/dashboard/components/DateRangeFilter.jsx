export function DateRangeFilter({ value, onChange }) {
  return (
    <select aria-label="Dashboard reporting period" className="input max-w-52" value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="today">Today</option>
      <option value="last7">Last 7 days</option>
      <option value="last30">Last 30 days</option>
      <option value="currentMonth">Current month</option>
      <option value="previousMonth">Previous month</option>
    </select>
  );
}
