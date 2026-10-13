# Module 8: Customer Engagement

## Implemented

- Product reviews with customer CRUD, verified-purchase detection, rating summaries, moderation, and admin review management.
- User notifications with unread counts, read/read-all actions, expiring messages, and admin broadcast creation.
- Contact messages with public submission, customer history, admin status updates, and admin replies.
- Support tickets with customer conversations, admin replies, assignment, priority/status management, and internal notes hidden from customers.
- Additive migration: `database/migrations/008_customer_engagement.sql`.
- Customer React experiences for reviews, notifications, contact, and support tickets.
- Admin React screens for review moderation, notification broadcasts, contact inbox, and support ticket handling.

## API Summary

```text
GET /api/v1/products/:productId/reviews
GET /api/v1/products/:productId/reviews/summary
POST /api/v1/products/:productId/reviews
GET /api/v1/reviews/my-reviews
PATCH /api/v1/reviews/:reviewId
DELETE /api/v1/reviews/:reviewId
GET /api/v1/admin/reviews
PATCH /api/v1/admin/reviews/:reviewId/moderation

GET /api/v1/notifications
GET /api/v1/notifications/unread-count
PATCH /api/v1/notifications/:notificationId/read
PATCH /api/v1/notifications/read-all
GET /api/v1/admin/notifications
POST /api/v1/admin/notifications

POST /api/v1/contact
GET /api/v1/contact/my-messages
GET /api/v1/admin/contact-messages
GET /api/v1/admin/contact-messages/:messageId
PATCH /api/v1/admin/contact-messages/:messageId
POST /api/v1/admin/contact-messages/:messageId/replies

POST /api/v1/support/tickets
GET /api/v1/support/tickets
GET /api/v1/support/tickets/:ticketId
POST /api/v1/support/tickets/:ticketId/messages
PATCH /api/v1/support/tickets/:ticketId/status
GET /api/v1/admin/support/tickets
GET /api/v1/admin/support/tickets/:ticketId
POST /api/v1/admin/support/tickets/:ticketId/messages
PATCH /api/v1/admin/support/tickets/:ticketId
```

## Setup

```bash
cd backend
npm run db:migrate:customer-engagement
npm test

cd ../frontend
npm run build
```

## Data Model

```text
ProductReviews belongs to Products and Users.
Notifications belongs to Users, with optional target metadata and expiry.
ContactMessages may belong to Users and stores public inquiry lifecycle fields.
SupportTickets belongs to Users and has many SupportTicketMessages.
SupportTicketMessages can be customer/admin-authored and can be marked internal.
```

## Notes

- Customers only see approved public reviews, their own review history, their own notifications, and their own support tickets.
- Admin/SUPPORT users can moderate reviews, manage contact messages, and handle support tickets.
- Internal support notes are only returned through admin support endpoints.
