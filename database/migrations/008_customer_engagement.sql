/*
  Module 8 customer engagement additive migration.
  Reuses existing baseline tables and creates only missing engagement structures.
*/

IF OBJECT_ID('dbo.ProductReviews', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.ProductReviews (
    ProductReviewId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_ProductReviews PRIMARY KEY,
    ProductId UNIQUEIDENTIFIER NOT NULL,
    UserId UNIQUEIDENTIFIER NOT NULL,
    OrderItemId UNIQUEIDENTIFIER NULL,
    Rating INT NOT NULL,
    ReviewTitle NVARCHAR(200) NULL,
    ReviewText NVARCHAR(2000) NOT NULL,
    ReviewStatus VARCHAR(30) NOT NULL CONSTRAINT DF_ProductReviews_Status DEFAULT ('PENDING'),
    IsVerifiedPurchase BIT NOT NULL CONSTRAINT DF_ProductReviews_Verified DEFAULT (0),
    ModeratedByUserId UNIQUEIDENTIFIER NULL,
    ModeratedAtUtc DATETIME2 NULL,
    CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_ProductReviews_CreatedAtUtc DEFAULT SYSUTCDATETIME(),
    UpdatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_ProductReviews_UpdatedAtUtc DEFAULT SYSUTCDATETIME()
  );
END
GO

IF COL_LENGTH('dbo.ProductReviews', 'IsVerifiedPurchase') IS NULL
  ALTER TABLE dbo.ProductReviews ADD IsVerifiedPurchase BIT NOT NULL CONSTRAINT DF_ProductReviews_IsVerifiedPurchase_Added DEFAULT (0);
IF COL_LENGTH('dbo.ProductReviews', 'ModeratedByUserId') IS NULL
  ALTER TABLE dbo.ProductReviews ADD ModeratedByUserId UNIQUEIDENTIFIER NULL;
IF COL_LENGTH('dbo.ProductReviews', 'ModeratedAtUtc') IS NULL
  ALTER TABLE dbo.ProductReviews ADD ModeratedAtUtc DATETIME2 NULL;
GO

IF OBJECT_ID('dbo.Notifications', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Notifications (
    NotificationId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_Notifications PRIMARY KEY,
    UserId UNIQUEIDENTIFIER NOT NULL,
    NotificationType VARCHAR(50) NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Message NVARCHAR(1000) NOT NULL,
    RelatedEntityType VARCHAR(50) NULL,
    RelatedEntityId UNIQUEIDENTIFIER NULL,
    ReadAtUtc DATETIME2 NULL,
    ExpiresAtUtc DATETIME2 NULL,
    CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_Notifications_CreatedAtUtc DEFAULT SYSUTCDATETIME()
  );
END
GO

IF COL_LENGTH('dbo.Notifications', 'ExpiresAtUtc') IS NULL
  ALTER TABLE dbo.Notifications ADD ExpiresAtUtc DATETIME2 NULL;
GO

IF OBJECT_ID('dbo.ContactMessages', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.ContactMessages (
    ContactMessageId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_ContactMessages PRIMARY KEY,
    UserId UNIQUEIDENTIFIER NULL,
    Name NVARCHAR(200) NOT NULL,
    Email NVARCHAR(320) NOT NULL,
    Subject NVARCHAR(200) NOT NULL,
    Message NVARCHAR(4000) NOT NULL,
    MessageStatus VARCHAR(30) NOT NULL CONSTRAINT DF_ContactMessages_Status DEFAULT ('NEW'),
    AssignedToUserId UNIQUEIDENTIFIER NULL,
    AdminResponse NVARCHAR(4000) NULL,
    CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_ContactMessages_CreatedAtUtc DEFAULT SYSUTCDATETIME(),
    UpdatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_ContactMessages_UpdatedAtUtc DEFAULT SYSUTCDATETIME(),
    ResolvedAtUtc DATETIME2 NULL
  );
END
GO

IF COL_LENGTH('dbo.ContactMessages', 'UserId') IS NULL
  ALTER TABLE dbo.ContactMessages ADD UserId UNIQUEIDENTIFIER NULL;
IF COL_LENGTH('dbo.ContactMessages', 'AdminResponse') IS NULL
  ALTER TABLE dbo.ContactMessages ADD AdminResponse NVARCHAR(4000) NULL;
GO

IF OBJECT_ID('dbo.SupportTickets', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.SupportTickets (
    SupportTicketId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_SupportTickets PRIMARY KEY,
    TicketNumber NVARCHAR(50) NOT NULL,
    UserId UNIQUEIDENTIFIER NOT NULL,
    OrderId UNIQUEIDENTIFIER NULL,
    Subject NVARCHAR(200) NOT NULL,
    Description NVARCHAR(4000) NOT NULL,
    Category NVARCHAR(80) NULL,
    TicketStatus VARCHAR(30) NOT NULL CONSTRAINT DF_SupportTickets_Status DEFAULT ('OPEN'),
    Priority VARCHAR(20) NOT NULL CONSTRAINT DF_SupportTickets_Priority DEFAULT ('NORMAL'),
    AssignedToUserId UNIQUEIDENTIFIER NULL,
    CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_SupportTickets_CreatedAtUtc DEFAULT SYSUTCDATETIME(),
    UpdatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_SupportTickets_UpdatedAtUtc DEFAULT SYSUTCDATETIME(),
    ResolvedAtUtc DATETIME2 NULL,
    ClosedAtUtc DATETIME2 NULL
  );
END
GO

IF COL_LENGTH('dbo.SupportTickets', 'Category') IS NULL
  ALTER TABLE dbo.SupportTickets ADD Category NVARCHAR(80) NULL;
GO

IF OBJECT_ID('dbo.SupportTicketMessages', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.SupportTicketMessages (
    SupportTicketMessageId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_SupportTicketMessages PRIMARY KEY,
    SupportTicketId UNIQUEIDENTIFIER NOT NULL,
    SenderUserId UNIQUEIDENTIFIER NOT NULL,
    Message NVARCHAR(4000) NOT NULL,
    IsInternalNote BIT NOT NULL CONSTRAINT DF_SupportTicketMessages_Internal DEFAULT (0),
    CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_SupportTicketMessages_CreatedAtUtc DEFAULT SYSUTCDATETIME(),
    UpdatedAtUtc DATETIME2 NULL
  );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_ProductReviews_Rating')
  ALTER TABLE dbo.ProductReviews WITH CHECK ADD CONSTRAINT CK_ProductReviews_Rating CHECK (Rating BETWEEN 1 AND 5);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_ProductReviews_User_Product' AND object_id = OBJECT_ID(N'dbo.ProductReviews'))
  CREATE UNIQUE INDEX UX_ProductReviews_User_Product ON dbo.ProductReviews(UserId, ProductId);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_ProductReviews_Product_Status' AND object_id = OBJECT_ID(N'dbo.ProductReviews'))
  CREATE INDEX IX_ProductReviews_Product_Status ON dbo.ProductReviews(ProductId, ReviewStatus, CreatedAtUtc DESC);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Notifications_User_Unread' AND object_id = OBJECT_ID(N'dbo.Notifications'))
  CREATE INDEX IX_Notifications_User_Unread ON dbo.Notifications(UserId, ReadAtUtc, CreatedAtUtc DESC);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_ContactMessages_Status_Date' AND object_id = OBJECT_ID(N'dbo.ContactMessages'))
  CREATE INDEX IX_ContactMessages_Status_Date ON dbo.ContactMessages(MessageStatus, CreatedAtUtc DESC);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_SupportTickets_Number' AND object_id = OBJECT_ID(N'dbo.SupportTickets'))
  CREATE UNIQUE INDEX UX_SupportTickets_Number ON dbo.SupportTickets(TicketNumber);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_SupportTickets_User_Date' AND object_id = OBJECT_ID(N'dbo.SupportTickets'))
  CREATE INDEX IX_SupportTickets_User_Date ON dbo.SupportTickets(UserId, CreatedAtUtc DESC);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_SupportTicketMessages_Ticket_Date' AND object_id = OBJECT_ID(N'dbo.SupportTicketMessages'))
  CREATE INDEX IX_SupportTicketMessages_Ticket_Date ON dbo.SupportTicketMessages(SupportTicketId, CreatedAtUtc ASC);
GO
