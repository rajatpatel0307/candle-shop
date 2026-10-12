/*
  Adds SessionId to RefreshTokens for authentication session management.
  Run after 001_candle_ecommerce_schema.sql.
*/

IF COL_LENGTH('dbo.RefreshTokens', 'SessionId') IS NULL
BEGIN
  ALTER TABLE dbo.RefreshTokens
    ADD SessionId UNIQUEIDENTIFIER NULL;

  UPDATE dbo.RefreshTokens
  SET SessionId = RefreshTokenId
  WHERE SessionId IS NULL;

  ALTER TABLE dbo.RefreshTokens
    ALTER COLUMN SessionId UNIQUEIDENTIFIER NOT NULL;

  CREATE INDEX IX_RefreshTokens_User_Session
    ON dbo.RefreshTokens(UserId, SessionId)
    INCLUDE (ExpiresAtUtc, RevokedAtUtc, CreatedAtUtc);
END
GO
