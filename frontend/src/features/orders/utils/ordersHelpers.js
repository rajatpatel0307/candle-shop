export function currency(value, code = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: code, maximumFractionDigits: 2 }).format(Number(value || 0));
}

export function formatDate(value) {
  return value ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Pending';
}

export function orderError(error) {
  return error?.response?.data?.error?.message || error?.message || 'Something went wrong.';
}
