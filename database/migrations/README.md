# Database Migrations

Place the provided `001_candle_ecommerce_schema.sql` file in this folder and run it once against an empty `CandleEcommerce` database.

Then run:

1. `002_auth_session_id.sql`

Expected local backend configuration for Windows Integrated Security:

```env
DB_DRIVER=msnodesqlv8
DB_SERVER=RAJAT_PATEL\SQLEXPRESS
DB_NAME=CandleEcommerce
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true
```

After running the schema, restart the backend. The terminal should print:

```text
Database connected: CandleEcommerce on RAJAT_PATEL\SQLEXPRESS
Database schema ready.
```
