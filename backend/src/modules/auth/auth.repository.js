import { randomUUID } from 'node:crypto';
import { getPool, sql } from '../../config/database.js';
import { CUSTOMER_ROLE } from './auth.constants.js';

const userColumns = `
  u.UserId, u.FirstName, u.LastName, u.Email, u.PhoneNumber, u.PasswordHash,
  u.AccountStatus, u.EmailVerifiedAtUtc, u.LastLoginAtUtc, u.FailedLoginCount, u.LockedUntilUtc,
  STRING_AGG(r.RoleCode, ',') AS Roles
`;

function mapUserResult(result) {
  return result.recordset[0] ?? null;
}

export async function findUserByEmail(email) {
  const pool = await getPool();
  const result = await pool.request()
    .input('email', sql.NVarChar(320), email)
    .query(`
      SELECT ${userColumns}
      FROM dbo.Users u
      LEFT JOIN dbo.UserRoles ur ON ur.UserId = u.UserId
      LEFT JOIN dbo.Roles r ON r.RoleId = ur.RoleId
      WHERE u.NormalizedEmail = LOWER(LTRIM(RTRIM(@email))) AND u.IsDeleted = 0
      GROUP BY u.UserId, u.FirstName, u.LastName, u.Email, u.PhoneNumber, u.PasswordHash,
        u.AccountStatus, u.EmailVerifiedAtUtc, u.LastLoginAtUtc, u.FailedLoginCount, u.LockedUntilUtc;
    `);
  return mapUserResult(result);
}

export async function findUserById(userId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('userId', sql.UniqueIdentifier, userId)
    .query(`
      SELECT ${userColumns}
      FROM dbo.Users u
      LEFT JOIN dbo.UserRoles ur ON ur.UserId = u.UserId
      LEFT JOIN dbo.Roles r ON r.RoleId = ur.RoleId
      WHERE u.UserId = @userId AND u.IsDeleted = 0
      GROUP BY u.UserId, u.FirstName, u.LastName, u.Email, u.PhoneNumber, u.PasswordHash,
        u.AccountStatus, u.EmailVerifiedAtUtc, u.LastLoginAtUtc, u.FailedLoginCount, u.LockedUntilUtc;
    `);
  return mapUserResult(result);
}

export async function createCustomerUser({ firstName, lastName, email, phoneNumber, passwordHash }) {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  try {
    const userId = randomUUID();
    const request = new sql.Request(transaction);
    const user = await request
      .input('userId', sql.UniqueIdentifier, userId)
      .input('firstName', sql.NVarChar(100), firstName)
      .input('lastName', sql.NVarChar(100), lastName || null)
      .input('email', sql.NVarChar(320), email)
      .input('phoneNumber', sql.NVarChar(30), phoneNumber || null)
      .input('passwordHash', sql.NVarChar(255), passwordHash)
      .query(`
        INSERT INTO dbo.Users (UserId, FirstName, LastName, Email, PhoneNumber, PasswordHash, AccountStatus)
        OUTPUT inserted.UserId, inserted.FirstName, inserted.LastName, inserted.Email, inserted.PhoneNumber,
          inserted.PasswordHash, inserted.AccountStatus, inserted.EmailVerifiedAtUtc, inserted.LastLoginAtUtc,
          inserted.FailedLoginCount, inserted.LockedUntilUtc
        VALUES (@userId, @firstName, @lastName, @email, @phoneNumber, @passwordHash, N'Pending');
      `);

    await new sql.Request(transaction)
      .input('userId', sql.UniqueIdentifier, userId)
      .input('roleCode', sql.NVarChar(40), CUSTOMER_ROLE)
      .query(`
        INSERT INTO dbo.UserRoles (UserId, RoleId)
        SELECT @userId, RoleId FROM dbo.Roles WHERE RoleCode = @roleCode;
      `);

    await transaction.commit();
    return { ...user.recordset[0], Roles: CUSTOMER_ROLE };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function updateLoginSuccess(userId) {
  const pool = await getPool();
  await pool.request()
    .input('userId', sql.UniqueIdentifier, userId)
    .query(`
      UPDATE dbo.Users
      SET LastLoginAtUtc = SYSUTCDATETIME(),
          FailedLoginCount = 0,
          LockedUntilUtc = NULL,
          UpdatedAtUtc = SYSUTCDATETIME()
      WHERE UserId = @userId;
    `);
}

export async function updateLoginFailure(userId, failedCount, lockUntil = null) {
  const pool = await getPool();
  await pool.request()
    .input('userId', sql.UniqueIdentifier, userId)
    .input('failedCount', sql.SmallInt, failedCount)
    .input('lockUntil', sql.DateTime2, lockUntil)
    .query(`
      UPDATE dbo.Users
      SET FailedLoginCount = @failedCount,
          LockedUntilUtc = @lockUntil,
          UpdatedAtUtc = SYSUTCDATETIME()
      WHERE UserId = @userId;
    `);
}

export async function setPasswordHash(userId, passwordHash) {
  const pool = await getPool();
  await pool.request()
    .input('userId', sql.UniqueIdentifier, userId)
    .input('passwordHash', sql.NVarChar(255), passwordHash)
    .query(`
      UPDATE dbo.Users
      SET PasswordHash = @passwordHash, UpdatedAtUtc = SYSUTCDATETIME()
      WHERE UserId = @userId;
    `);
}

export async function markEmailVerified(userId) {
  const pool = await getPool();
  await pool.request()
    .input('userId', sql.UniqueIdentifier, userId)
    .query(`
      UPDATE dbo.Users
      SET EmailVerifiedAtUtc = COALESCE(EmailVerifiedAtUtc, SYSUTCDATETIME()),
          AccountStatus = CASE WHEN AccountStatus = N'Pending' THEN N'Active' ELSE AccountStatus END,
          UpdatedAtUtc = SYSUTCDATETIME()
      WHERE UserId = @userId;
    `);
}

export async function createEmailVerificationToken(userId, tokenHashValue, expiresAt) {
  const pool = await getPool();
  await pool.request()
    .input('userId', sql.UniqueIdentifier, userId)
    .input('tokenHash', sql.VarBinary(64), tokenHashValue)
    .input('expiresAt', sql.DateTime2, expiresAt)
    .query(`
      INSERT INTO dbo.EmailVerificationTokens (UserId, TokenHash, ExpiresAtUtc)
      VALUES (@userId, @tokenHash, @expiresAt);
    `);
}

export async function consumeEmailVerificationToken(tokenHashValue) {
  const pool = await getPool();
  const result = await pool.request()
    .input('tokenHash', sql.VarBinary(64), tokenHashValue)
    .query(`
      UPDATE dbo.EmailVerificationTokens
      SET VerifiedAtUtc = SYSUTCDATETIME()
      OUTPUT inserted.UserId
      WHERE TokenHash = @tokenHash
        AND VerifiedAtUtc IS NULL
        AND ExpiresAtUtc > SYSUTCDATETIME();
    `);
  return result.recordset[0] ?? null;
}

export async function consumeEmailVerificationOtp(email, tokenHashValue) {
  const pool = await getPool();
  const result = await pool.request()
    .input('email', sql.NVarChar(320), email)
    .input('tokenHash', sql.VarBinary(64), tokenHashValue)
    .query(`
      UPDATE evt
      SET VerifiedAtUtc = SYSUTCDATETIME()
      OUTPUT inserted.UserId
      FROM dbo.EmailVerificationTokens evt
      INNER JOIN dbo.Users u ON u.UserId = evt.UserId
      WHERE u.NormalizedEmail = LOWER(LTRIM(RTRIM(@email)))
        AND u.IsDeleted = 0
        AND evt.TokenHash = @tokenHash
        AND evt.VerifiedAtUtc IS NULL
        AND evt.ExpiresAtUtc > SYSUTCDATETIME();
    `);
  return result.recordset[0] ?? null;
}

export async function createPasswordResetToken(userId, tokenHashValue, expiresAt) {
  const pool = await getPool();
  await pool.request()
    .input('userId', sql.UniqueIdentifier, userId)
    .input('tokenHash', sql.VarBinary(64), tokenHashValue)
    .input('expiresAt', sql.DateTime2, expiresAt)
    .query(`
      INSERT INTO dbo.PasswordResetTokens (UserId, TokenHash, ExpiresAtUtc)
      VALUES (@userId, @tokenHash, @expiresAt);
    `);
}

export async function consumePasswordResetToken(tokenHashValue) {
  const pool = await getPool();
  const result = await pool.request()
    .input('tokenHash', sql.VarBinary(64), tokenHashValue)
    .query(`
      UPDATE dbo.PasswordResetTokens
      SET UsedAtUtc = SYSUTCDATETIME()
      OUTPUT inserted.UserId
      WHERE TokenHash = @tokenHash
        AND UsedAtUtc IS NULL
        AND ExpiresAtUtc > SYSUTCDATETIME();
    `);
  return result.recordset[0] ?? null;
}

export async function createRefreshToken({ userId, sessionId, tokenHashValue, expiresAt, ip, userAgent }) {
  const pool = await getPool();
  const result = await pool.request()
    .input('userId', sql.UniqueIdentifier, userId)
    .input('sessionId', sql.UniqueIdentifier, sessionId)
    .input('tokenHash', sql.VarBinary(64), tokenHashValue)
    .input('expiresAt', sql.DateTime2, expiresAt)
    .input('ip', sql.NVarChar(45), ip)
    .input('userAgent', sql.NVarChar(500), userAgent)
    .query(`
      INSERT INTO dbo.RefreshTokens (RefreshTokenId, UserId, TokenHash, ExpiresAtUtc, CreatedByIp, UserAgent)
      OUTPUT inserted.RefreshTokenId, inserted.RefreshTokenId AS SessionId
      VALUES (@sessionId, @userId, @tokenHash, @expiresAt, @ip, @userAgent);
    `);
  return result.recordset[0];
}

export async function findRefreshToken(tokenHashValue) {
  const pool = await getPool();
  const result = await pool.request()
    .input('tokenHash', sql.VarBinary(64), tokenHashValue)
    .query(`
      SELECT RefreshTokenId, UserId, RefreshTokenId AS SessionId, ExpiresAtUtc, RevokedAtUtc, ReplacedByTokenId
      FROM dbo.RefreshTokens
      WHERE TokenHash = @tokenHash;
    `);
  return result.recordset[0] ?? null;
}

export async function rotateRefreshToken({ oldTokenId, newTokenId, userId, tokenHashValue, expiresAt, ip, userAgent }) {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  try {
    await new sql.Request(transaction)
      .input('newTokenId', sql.UniqueIdentifier, newTokenId)
      .input('userId', sql.UniqueIdentifier, userId)
      .input('tokenHash', sql.VarBinary(64), tokenHashValue)
      .input('expiresAt', sql.DateTime2, expiresAt)
      .input('ip', sql.NVarChar(45), ip)
      .input('userAgent', sql.NVarChar(500), userAgent)
      .query(`
        INSERT INTO dbo.RefreshTokens (RefreshTokenId, UserId, TokenHash, ExpiresAtUtc, CreatedByIp, UserAgent)
        VALUES (@newTokenId, @userId, @tokenHash, @expiresAt, @ip, @userAgent);
      `);

    const rotated = await new sql.Request(transaction)
      .input('oldTokenId', sql.UniqueIdentifier, oldTokenId)
      .input('newTokenId', sql.UniqueIdentifier, newTokenId)
      .query(`
        UPDATE dbo.RefreshTokens
        SET RevokedAtUtc = SYSUTCDATETIME(), ReplacedByTokenId = @newTokenId
        WHERE RefreshTokenId = @oldTokenId AND RevokedAtUtc IS NULL;
      `);

    if (rotated.rowsAffected[0] !== 1) {
      throw new Error('Refresh token was already rotated.');
    }

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function revokeRefreshToken(tokenHashValue) {
  const pool = await getPool();
  await pool.request()
    .input('tokenHash', sql.VarBinary(64), tokenHashValue)
    .query(`
      UPDATE dbo.RefreshTokens
      SET RevokedAtUtc = COALESCE(RevokedAtUtc, SYSUTCDATETIME())
      WHERE TokenHash = @tokenHash;
    `);
}

export async function revokeSession(userId, sessionId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('userId', sql.UniqueIdentifier, userId)
    .input('sessionId', sql.UniqueIdentifier, sessionId)
    .query(`
      UPDATE dbo.RefreshTokens
      SET RevokedAtUtc = COALESCE(RevokedAtUtc, SYSUTCDATETIME())
      WHERE UserId = @userId AND RefreshTokenId = @sessionId AND RevokedAtUtc IS NULL;
    `);
  return result.rowsAffected[0] > 0;
}

export async function revokeAllSessions(userId) {
  const pool = await getPool();
  await pool.request()
    .input('userId', sql.UniqueIdentifier, userId)
    .query(`
      UPDATE dbo.RefreshTokens
      SET RevokedAtUtc = COALESCE(RevokedAtUtc, SYSUTCDATETIME())
      WHERE UserId = @userId AND RevokedAtUtc IS NULL;
    `);
}

export async function listSessions(userId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('userId', sql.UniqueIdentifier, userId)
    .query(`
      SELECT RefreshTokenId AS SessionId, CreatedAtUtc, ExpiresAtUtc, CreatedByIp, UserAgent,
             CASE WHEN RevokedAtUtc IS NULL AND ExpiresAtUtc > SYSUTCDATETIME() THEN 1 ELSE 0 END AS IsActive
      FROM dbo.RefreshTokens
      WHERE UserId = @userId
      ORDER BY CreatedAtUtc DESC;
    `);
  return result.recordset;
}
