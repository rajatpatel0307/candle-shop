# Backend

## Requirements
- Node.js LTS
- Microsoft SQL Server instance and a database named `CandleEcommerce` (or update `.env`)
- A SQL login with only the permissions required by the application

## Run
```bash
npm install
cp .env.example .env
# Update database connection values in .env
npm run dev
```

Health endpoint: `GET http://localhost:3000/api/v1/health`
Readiness endpoint (checks MSSQL): `GET http://localhost:3000/api/v1/health/ready`

This is a starter foundation, not a complete production commerce API. Auth, product CRUD, cart, checkout, payment, inventory and admin endpoints must be implemented and tested before launch. Do not deploy with placeholder credentials.
