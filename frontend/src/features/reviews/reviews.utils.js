export function reviewMessage(error) { return error?.response?.data?.error?.message || error?.message || 'Review action failed.'; }

export function reviewStatusLabel(status) {
  return { APPROVED: 'Published', PUBLISHED: 'Published', HIDDEN: 'Hidden', REJECTED: 'Removed' }[String(status || '').toUpperCase()] || 'Not published';
}
