import { useEffect, useState } from 'react';

export function TicketAssignment({ assigneeId = '', pending = false, onAssign }) {
  const [value, setValue] = useState(assigneeId || '');

  useEffect(() => {
    setValue(assigneeId || '');
  }, [assigneeId]);

  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-stone-900">Assignment</h2>
      <form
        className="mt-4 flex flex-col gap-3 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          if (value.trim()) {
            onAssign?.(value.trim());
          }
        }}
      >
        <input
          className="min-h-11 flex-1 rounded-lg border border-stone-300 px-3 text-sm outline-none focus:border-[#8d5132] focus:ring-2 focus:ring-[#8d5132]/20"
          inputMode="numeric"
          placeholder="Admin user ID"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <button className="min-h-11 rounded-lg bg-[#8d5132] px-4 text-sm font-semibold text-white disabled:opacity-60" type="submit" disabled={pending}>
          Assign
        </button>
      </form>
    </section>
  );
}
