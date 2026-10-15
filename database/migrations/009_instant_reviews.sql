SET XACT_ABORT ON;
BEGIN TRANSACTION;
UPDATE dbo.ProductReviews
SET ReviewStatus = 'APPROVED', UpdatedAtUtc = SYSUTCDATETIME(),
    ModeratedByUserId = NULL, ModeratedAtUtc = NULL
WHERE UPPER(ReviewStatus) = 'PENDING';
COMMIT;
