export function StarRating({ value = 0, onChange }) {
  return <div className="flex gap-1">{[1, 2, 3, 4, 5].map((star) => <button key={star} type="button" className={`text-xl ${star <= value ? 'text-[#b56b45]' : 'text-stone-300'}`} onClick={() => onChange?.(star)}>★</button>)}</div>;
}
