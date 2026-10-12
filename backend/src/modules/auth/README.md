# Authentication module

Implement registration, login, logout, session/token renewal, password reset, and rate limiting here.

Before production:
- Choose a session-cookie or short-lived JWT + refresh-token strategy.
- Hash passwords using bcrypt or Argon2id.
- Implement authorization middleware and session revocation.
- Add CSRF protection if cookie authentication is used.
- Never return password hashes or secrets.
