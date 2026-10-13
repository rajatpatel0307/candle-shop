export function reviewModeratedNotification(review, status) {
  return {
    userId: review.UserId,
    title: `Review ${status.toLowerCase()}`,
    message: `Your product review was ${status.toLowerCase()}.`,
    type: 'REVIEW',
    relatedEntityType: 'ProductReview',
    relatedEntityId: review.ProductReviewId,
  };
}

export function ticketReplyNotification(ticket, message = 'Your support ticket has a new reply.') {
  return {
    userId: ticket.UserId,
    title: `Ticket ${ticket.TicketNumber}`,
    message,
    type: 'SUPPORT',
    relatedEntityType: 'SupportTicket',
    relatedEntityId: ticket.SupportTicketId,
  };
}
