# Checkout module

Checkout must:
1. Reload product variant prices and availability from the database.
2. Calculate discounts, shipping, tax and totals on the server.
3. Reserve stock and create the pending order in a SQL transaction.
4. Use idempotency keys to prevent duplicate orders.
5. Create the payment session after the database transaction commits.
6. Never trust a frontend payment-success redirect.
