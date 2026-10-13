export function CheckoutReview({ validation }) {
  if (!validation) return null;
  if (validation.isValid) return <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">Checkout is ready.</p>;
  return <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">Review address, stock, and pricing issues before submitting.</p>;
}
