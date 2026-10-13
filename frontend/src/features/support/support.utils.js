export function ticketError(error) { return error?.response?.data?.error?.message || error?.message || 'Ticket action failed.'; }
