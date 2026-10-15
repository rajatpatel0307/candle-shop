Admin workflow verification
===========================

The admin integration suite uses temporary users, products, shipping settings,
content, messages and tickets in the configured SQL database. It removes its own
fixtures in `finally` and does not call a payment provider or send email.

Apply the compatibility repairs on another installation before starting the API:

```powershell
cd backend
npm run db:migrate:admin-repairs
```

Run unit tests with `npm test`. To include all database workflows:

```powershell
$env:RUN_ADMIN_DB_TESTS='1'
$env:RUN_CHECKOUT_DB_TESTS='1'
node --test --test-concurrency=1
```

Use sequential execution for the local ODBC driver. To exercise the running app
and frontend proxy, set `ADMIN_TEST_BASE_URL` and `CHECKOUT_TEST_BASE_URL` to
`http://localhost:5173` before running the tests. Without these variables, tests
use the Express app directly.

The repairs add inventory reorder quantity, store setting descriptions and public
visibility, and expand setting value storage. Existing records are preserved.
