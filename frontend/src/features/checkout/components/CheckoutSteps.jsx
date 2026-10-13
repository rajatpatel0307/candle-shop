const steps = ['Cart', 'Addresses', 'Shipping', 'Review', 'Payment'];

export function CheckoutSteps({ current = 1 }) {
  return (
    <ol className="grid gap-2 sm:grid-cols-5">
      {steps.map((step, index) => (
        <li key={step} className={`rounded-md border px-3 py-2 text-sm font-semibold ${index <= current ? 'border-[#b56b45] bg-white text-[#2f2722]' : 'border-stone-200 text-stone-500'}`}>
          {step}
        </li>
      ))}
    </ol>
  );
}
