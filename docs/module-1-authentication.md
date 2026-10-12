# Module 1: Authentication and Authorization

## Implemented Backend Files

- `backend/src/modules/auth/auth.routes.js`
- `backend/src/modules/auth/auth.controller.js`
- `backend/src/modules/auth/auth.service.js`
- `backend/src/modules/auth/auth.repository.js`
- `backend/src/modules/auth/auth.validation.js`
- `backend/src/modules/auth/auth.middleware.js`
- `backend/src/modules/auth/auth.policy.js`
- `backend/src/modules/auth/auth.constants.js`
- `backend/src/modules/auth/auth.utils.js`
- `backend/src/modules/auth/auth.email.service.js`
- `backend/src/modules/auth/auth.token.service.js`
- `backend/src/modules/auth/auth.session.service.js`
- `backend/src/modules/auth/auth.rateLimit.js`
- `backend/src/modules/auth/index.js`
- `backend/src/common/middleware/authenticate.js`
- `backend/src/common/middleware/authorize.js`

## Implemented Frontend Files

- `frontend/src/features/auth/api/authApi.js`
- `frontend/src/features/auth/components/*`
- `frontend/src/features/auth/pages/*`
- `frontend/src/features/auth/store/authSlice.js`
- `frontend/src/features/auth/hooks/useAuth.js`
- `frontend/src/features/auth/schemas/authSchemas.js`
- `frontend/src/features/auth/utils/authHelpers.js`
- `frontend/src/app/store.js`
- `frontend/src/app/ReduxProvider.jsx`

## API Endpoints

All endpoints are under `/api/v1/auth`.

- `POST /register`
- `POST /login`
- `POST /refresh`
- `POST /logout`
- `POST /logout-all`
- `GET /me`
- `POST /verify-email`
- `POST /resend-verification`
- `POST /forgot-password`
- `POST /reset-password`
- `POST /change-password`
- `GET /sessions`
- `DELETE /sessions/:sessionId`

## Schema Compatibility

The module uses the existing baseline tables:

- `Users`
- `Roles`
- `UserRoles`
- `RefreshTokens`
- `PasswordResetTokens`
- `EmailVerificationTokens`

The baseline `RefreshTokens` table did not include `SessionId`, which is required for session management and refresh-token rotation. Run:

```sql
database/migrations/002_auth_session_id.sql
```

after the baseline schema.

## Local Setup

Install dependencies:

```bash
npm install --prefix backend
npm install --prefix frontend
```

Required backend auth env values are included in `backend/.env.example`.

For local development without SMTP configured, verification and reset links are printed to the backend terminal as disabled email warnings.

## Verification

Run backend tests:

```bash
cd backend
npm test
```

Run frontend build:

```bash
cd frontend
npm run build
```

Manual API checks:

```powershell
Invoke-RestMethod http://localhost:3000/api/v1/health/ready
```

Then register through `/register` or:

```powershell
Invoke-RestMethod -Method Post http://localhost:3000/api/v1/auth/register `
  -ContentType "application/json" `
  -Body '{"firstName":"Rajat","email":"rajat@example.com","password":"Strong@123"}'
```
