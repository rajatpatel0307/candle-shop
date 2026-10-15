export function CartValidationMessages({ validation }) {
  if (!validation || validation.isValid) return null;
  return (
    <section role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs leading-6 text-red-800">
      <h2 className="font-semibold">Cart needs attention</h2>
      <ul className="mt-2 grid gap-1">
        {validation.errors?.map((error, index) => <li key={`${error.itemId}-${index}`}>{error.message}</li>)}
      </ul>
    </section>
  );
}
