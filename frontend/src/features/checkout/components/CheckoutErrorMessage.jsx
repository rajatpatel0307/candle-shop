import { checkoutError } from '../utils/checkoutHelpers.js';

export function CheckoutErrorMessage({ error }) {
  if (!error) return null;
  return <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{checkoutError(error)}</p>;
}
