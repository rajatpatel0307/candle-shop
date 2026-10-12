# Payments module

Implement a provider adapter after selecting the payment gateway. Verify webhook signatures using the provider's required raw request bytes, persist/deduplicate provider event IDs, handle retries and delayed events, and keep refunds separate from order cancellation. Never store raw card numbers or CVV.
