# Candle E-Commerce Project Structure

Modular JavaScript project structure for a candle-selling e-commerce platform.

## Stack
- Frontend: React + Vite + JavaScript + Tailwind CSS
- Backend: Node.js + Express.js + JavaScript ES modules
- Database: Microsoft SQL Server (MSSQL)
- API: REST `/api/v1`

## Repository layout
- `frontend/`: customer storefront and admin UI
- `backend/`: Express API and modular business logic
- `database/`: SQL migrations, seeds, views, and stored procedures
- `docs/`: SRS and SDD can be placed here

## Implemented baseline
The project is now wired as a runnable baseline against the provided MSSQL schema.

- Storefront pages: home, shop, product detail, categories, cart, checkout, orders, wishlist, account, and contact.
- Admin pages: schema-driven CRUD screens for the SQL baseline tables, grouped by catalog, stock, orders, payment, customers, and content.
- Backend APIs:
  - `GET /api/v1/store/home`
  - `GET /api/v1/store/products`
  - `GET /api/v1/store/products/:slug`
  - `GET /api/v1/store/categories`
  - `POST /api/v1/store/contact`
  - `GET /api/v1/admin/resources`
  - `GET|POST /api/v1/admin/resources/:resource`
  - `GET|PUT|DELETE /api/v1/admin/resources/:resource/:id`

## Local setup
1. Create the MSSQL database and run your baseline SQL script.
2. Copy `backend/.env.example` to `backend/.env` and fill in the database values.
3. Install dependencies if needed:
   ```bash
   npm install --prefix frontend
   npm install --prefix backend
   ```
4. Start the API:
   ```bash
   npm run dev:backend
   ```
5. Start the frontend:
   ```bash
   npm run dev:frontend
   ```

The Vite dev server proxies `/api` to `http://localhost:3000`.
