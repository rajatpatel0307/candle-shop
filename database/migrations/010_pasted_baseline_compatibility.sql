/*
  Compatibility patch for the pasted Candle E-Commerce MSSQL baseline.

  Run this AFTER the pasted baseline schema.
  It adds columns/tables required by Modules 5-9 where the baseline already
  created older table shapes.

  Important:
  - Your baseline has dbo.OrderItems.OrderItemId as BIGINT IDENTITY, while the
    current checkout code inserts GUID OrderItemId values.
  - Your baseline has dbo.ShipmentTrackingEvents.ShipmentTrackingEventId as
    BIGINT IDENTITY, while the current shipping code inserts GUID IDs.
  - Do not blindly ALTER those primary keys on a live DB with data. Either
    update backend code to use BIGINT identity for those two tables, or rebuild
    those tables in a planned migration before production data exists.
*/

SET XACT_ABORT ON;
GO

/* Module 5/6 compatibility: checkout, orders, payments, shipping, refunds */
IF COL_LENGTH('dbo.CheckoutSessions', 'IdempotencyKey') IS NULL ALTER TABLE dbo.CheckoutSessions ADD IdempotencyKey UNIQUEIDENTIFIER NULL;
IF COL_LENGTH('dbo.CheckoutSessions', 'RequestHash') IS NULL ALTER TABLE dbo.CheckoutSessions ADD RequestHash CHAR(64) NULL;
IF COL_LENGTH('dbo.CheckoutSessions', 'OrderId') IS NULL ALTER TABLE dbo.CheckoutSessions ADD OrderId UNIQUEIDENTIFIER NULL;
IF COL_LENGTH('dbo.CheckoutSessions', 'CouponCode') IS NULL ALTER TABLE dbo.CheckoutSessions ADD CouponCode NVARCHAR(50) NULL;
IF COL_LENGTH('dbo.CheckoutSessions', 'UpdatedAtUtc') IS NULL ALTER TABLE dbo.CheckoutSessions ADD UpdatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_CheckoutSessions_UpdatedAtUtc_Compat DEFAULT SYSUTCDATETIME();
GO

IF COL_LENGTH('dbo.Orders', 'IdempotencyKey') IS NULL ALTER TABLE dbo.Orders ADD IdempotencyKey UNIQUEIDENTIFIER NULL;
IF COL_LENGTH('dbo.Orders', 'CancellationReason') IS NULL ALTER TABLE dbo.Orders ADD CancellationReason NVARCHAR(500) NULL;
IF COL_LENGTH('dbo.Orders', 'CancelledAtUtc') IS NULL ALTER TABLE dbo.Orders ADD CancelledAtUtc DATETIME2 NULL;
GO

IF COL_LENGTH('dbo.Payments', 'IdempotencyKey') IS NULL ALTER TABLE dbo.Payments ADD IdempotencyKey UNIQUEIDENTIFIER NULL;
IF COL_LENGTH('dbo.Payments', 'ProviderOrderId') IS NULL ALTER TABLE dbo.Payments ADD ProviderOrderId NVARCHAR(200) NULL;
IF COL_LENGTH('dbo.Payments', 'FailureCode') IS NULL ALTER TABLE dbo.Payments ADD FailureCode NVARCHAR(100) NULL;
GO

IF OBJECT_ID('dbo.OrderCancellationRequests', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.OrderCancellationRequests (
    OrderCancellationRequestId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_OrderCancellationRequests PRIMARY KEY,
    OrderId UNIQUEIDENTIFIER NOT NULL,
    UserId UNIQUEIDENTIFIER NOT NULL,
    Reason NVARCHAR(500) NOT NULL,
    RequestStatus VARCHAR(30) NOT NULL,
    ReviewedByUserId UNIQUEIDENTIFIER NULL,
    ReviewNotes NVARCHAR(500) NULL,
    RequestedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_OrderCancellationRequests_RequestedAtUtc DEFAULT SYSUTCDATETIME(),
    ReviewedAtUtc DATETIME2 NULL
  );
END
GO

IF COL_LENGTH('dbo.Shipments', 'ShipmentNumber') IS NULL ALTER TABLE dbo.Shipments ADD ShipmentNumber NVARCHAR(100) NULL;
IF COL_LENGTH('dbo.Shipments', 'CarrierCode') IS NULL ALTER TABLE dbo.Shipments ADD CarrierCode NVARCHAR(100) NULL;
IF COL_LENGTH('dbo.Shipments', 'ShippingService') IS NULL ALTER TABLE dbo.Shipments ADD ShippingService NVARCHAR(100) NULL;
IF COL_LENGTH('dbo.Shipments', 'TrackingUrl') IS NULL ALTER TABLE dbo.Shipments ADD TrackingUrl NVARCHAR(1000) NULL;
IF COL_LENGTH('dbo.Shipments', 'ShippingCost') IS NULL ALTER TABLE dbo.Shipments ADD ShippingCost DECIMAL(18,2) NOT NULL CONSTRAINT DF_Shipments_ShippingCost_Compat DEFAULT (0);
GO

IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_Shipments_Status')
  ALTER TABLE dbo.Shipments DROP CONSTRAINT CK_Shipments_Status;
ALTER TABLE dbo.Shipments WITH CHECK ADD CONSTRAINT CK_Shipments_Status CHECK (ShipmentStatus IN (
  N'Pending', N'LabelCreated', N'Shipped', N'InTransit', N'OutForDelivery', N'Delivered', N'Failed', N'Returned',
  'CREATED', 'LABEL_CREATED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'DELIVERY_FAILED', 'RETURN_TO_SENDER', 'CANCELLED'
));
GO

IF OBJECT_ID('dbo.Refunds', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Refunds (
    RefundId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_Refunds PRIMARY KEY,
    OrderId UNIQUEIDENTIFIER NOT NULL,
    PaymentId UNIQUEIDENTIFIER NOT NULL,
    RefundNumber NVARCHAR(100) NOT NULL,
    ProviderRefundId NVARCHAR(200) NULL,
    RefundStatus VARCHAR(30) NOT NULL,
    RefundAmount DECIMAL(18,2) NOT NULL,
    CurrencyCode CHAR(3) NOT NULL,
    Reason NVARCHAR(500) NOT NULL,
    RequestedByUserId UNIQUEIDENTIFIER NULL,
    ApprovedByUserId UNIQUEIDENTIFIER NULL,
    IdempotencyKey UNIQUEIDENTIFIER NULL,
    CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_Refunds_CreatedAtUtc DEFAULT SYSUTCDATETIME(),
    UpdatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_Refunds_UpdatedAtUtc DEFAULT SYSUTCDATETIME(),
    CompletedAtUtc DATETIME2 NULL
  );
END
GO

IF OBJECT_ID('dbo.ShippingWebhookEvents', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.ShippingWebhookEvents (
    ShippingWebhookEventId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_ShippingWebhookEvents PRIMARY KEY,
    Provider VARCHAR(50) NOT NULL,
    ProviderEventId NVARCHAR(200) NOT NULL,
    EventType NVARCHAR(150) NOT NULL,
    ProcessingStatus VARCHAR(30) NOT NULL,
    PayloadJson NVARCHAR(MAX) NULL,
    ReceivedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_ShippingWebhookEvents_ReceivedAtUtc DEFAULT SYSUTCDATETIME(),
    ProcessedAtUtc DATETIME2 NULL,
    ProcessingError NVARCHAR(1000) NULL
  );
END
GO

/* Module 8 compatibility: reviews, notifications, contact, support */
IF COL_LENGTH('dbo.ProductReviews', 'IsVerifiedPurchase') IS NULL ALTER TABLE dbo.ProductReviews ADD IsVerifiedPurchase BIT NOT NULL CONSTRAINT DF_ProductReviews_IsVerifiedPurchase_Compat DEFAULT (0);
IF COL_LENGTH('dbo.ProductReviews', 'ModeratedByUserId') IS NULL ALTER TABLE dbo.ProductReviews ADD ModeratedByUserId UNIQUEIDENTIFIER NULL;
IF COL_LENGTH('dbo.ProductReviews', 'ModeratedAtUtc') IS NULL ALTER TABLE dbo.ProductReviews ADD ModeratedAtUtc DATETIME2 NULL;
GO

IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_ProductReviews_Status')
  ALTER TABLE dbo.ProductReviews DROP CONSTRAINT CK_ProductReviews_Status;
ALTER TABLE dbo.ProductReviews WITH CHECK ADD CONSTRAINT CK_ProductReviews_Status CHECK (ReviewStatus IN (
  N'Pending', N'Published', N'Rejected', N'Hidden', 'PENDING', 'APPROVED', 'REJECTED', 'HIDDEN'
));
GO

IF COL_LENGTH('dbo.Notifications', 'ExpiresAtUtc') IS NULL ALTER TABLE dbo.Notifications ADD ExpiresAtUtc DATETIME2 NULL;
GO

IF COL_LENGTH('dbo.ContactMessages', 'UserId') IS NULL ALTER TABLE dbo.ContactMessages ADD UserId UNIQUEIDENTIFIER NULL;
IF COL_LENGTH('dbo.ContactMessages', 'AdminResponse') IS NULL ALTER TABLE dbo.ContactMessages ADD AdminResponse NVARCHAR(4000) NULL;
IF COL_LENGTH('dbo.ContactMessages', 'UpdatedAtUtc') IS NULL ALTER TABLE dbo.ContactMessages ADD UpdatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_ContactMessages_UpdatedAtUtc_Compat DEFAULT SYSUTCDATETIME();
GO

IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_ContactMessages_Status')
  ALTER TABLE dbo.ContactMessages DROP CONSTRAINT CK_ContactMessages_Status;
ALTER TABLE dbo.ContactMessages WITH CHECK ADD CONSTRAINT CK_ContactMessages_Status CHECK (MessageStatus IN (
  N'New', N'InProgress', N'Resolved', N'Spam', 'NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'SPAM'
));
GO

IF COL_LENGTH('dbo.SupportTickets', 'Category') IS NULL ALTER TABLE dbo.SupportTickets ADD Category NVARCHAR(80) NULL;
IF COL_LENGTH('dbo.SupportTickets', 'ResolvedAtUtc') IS NULL ALTER TABLE dbo.SupportTickets ADD ResolvedAtUtc DATETIME2 NULL;
GO

IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_SupportTickets_Status')
  ALTER TABLE dbo.SupportTickets DROP CONSTRAINT CK_SupportTickets_Status;
ALTER TABLE dbo.SupportTickets WITH CHECK ADD CONSTRAINT CK_SupportTickets_Status CHECK (TicketStatus IN (
  N'Open', N'InProgress', N'WaitingForCustomer', N'Resolved', N'Closed',
  'OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED'
));
GO

IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_SupportTickets_Priority')
  ALTER TABLE dbo.SupportTickets DROP CONSTRAINT CK_SupportTickets_Priority;
ALTER TABLE dbo.SupportTickets WITH CHECK ADD CONSTRAINT CK_SupportTickets_Priority CHECK (Priority IN (
  N'Low', N'Normal', N'High', N'Urgent', 'LOW', 'NORMAL', 'HIGH', 'URGENT'
));
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

/* Module 9 compatibility: managed website content */
IF OBJECT_ID('dbo.HomepageBanners', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.HomepageBanners (
    HomepageBannerId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_HomepageBanners PRIMARY KEY,
    Title NVARCHAR(200) NOT NULL,
    Subtitle NVARCHAR(300) NULL,
    Description NVARCHAR(1000) NULL,
    DesktopImageUrl NVARCHAR(1000) NULL,
    MobileImageUrl NVARCHAR(1000) NULL,
    AltText NVARCHAR(250) NULL,
    ButtonText NVARCHAR(80) NULL,
    ButtonUrl NVARCHAR(1000) NULL,
    SecondaryButtonText NVARCHAR(80) NULL,
    SecondaryButtonUrl NVARCHAR(1000) NULL,
    DisplayOrder INT NOT NULL CONSTRAINT DF_HomepageBanners_DisplayOrder DEFAULT (0),
    BannerStatus VARCHAR(30) NOT NULL CONSTRAINT DF_HomepageBanners_Status DEFAULT ('DRAFT'),
    StartAtUtc DATETIME2 NULL,
    EndAtUtc DATETIME2 NULL,
    CreatedByUserId UNIQUEIDENTIFIER NULL,
    UpdatedByUserId UNIQUEIDENTIFIER NULL,
    CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_HomepageBanners_CreatedAtUtc DEFAULT SYSUTCDATETIME(),
    UpdatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_HomepageBanners_UpdatedAtUtc DEFAULT SYSUTCDATETIME()
  );
END
GO

IF OBJECT_ID('dbo.PromotionalSections', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.PromotionalSections (
    PromotionalSectionId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_PromotionalSections PRIMARY KEY,
    Title NVARCHAR(200) NOT NULL,
    Subtitle NVARCHAR(300) NULL,
    Description NVARCHAR(1500) NULL,
    ImageUrl NVARCHAR(1000) NULL,
    BackgroundImageUrl NVARCHAR(1000) NULL,
    LayoutType VARCHAR(40) NOT NULL CONSTRAINT DF_PromotionalSections_Layout DEFAULT ('IMAGE_LEFT'),
    ButtonText NVARCHAR(80) NULL,
    ButtonUrl NVARCHAR(1000) NULL,
    DisplayOrder INT NOT NULL CONSTRAINT DF_PromotionalSections_DisplayOrder DEFAULT (0),
    SectionStatus VARCHAR(30) NOT NULL CONSTRAINT DF_PromotionalSections_Status DEFAULT ('DRAFT'),
    StartAtUtc DATETIME2 NULL,
    EndAtUtc DATETIME2 NULL,
    CreatedByUserId UNIQUEIDENTIFIER NULL,
    UpdatedByUserId UNIQUEIDENTIFIER NULL,
    CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_PromotionalSections_CreatedAtUtc DEFAULT SYSUTCDATETIME(),
    UpdatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_PromotionalSections_UpdatedAtUtc DEFAULT SYSUTCDATETIME()
  );
END
GO

IF OBJECT_ID('dbo.ContentPages', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.ContentPages (
    ContentPageId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_ContentPages PRIMARY KEY,
    Title NVARCHAR(200) NOT NULL,
    Slug NVARCHAR(180) NOT NULL,
    PageType VARCHAR(40) NOT NULL CONSTRAINT DF_ContentPages_PageType DEFAULT ('CUSTOM'),
    Summary NVARCHAR(500) NULL,
    Content NVARCHAR(MAX) NOT NULL,
    ContentFormat VARCHAR(30) NOT NULL CONSTRAINT DF_ContentPages_Format DEFAULT ('HTML'),
    PageStatus VARCHAR(30) NOT NULL CONSTRAINT DF_ContentPages_Status DEFAULT ('DRAFT'),
    PublishedAtUtc DATETIME2 NULL,
    CreatedByUserId UNIQUEIDENTIFIER NULL,
    UpdatedByUserId UNIQUEIDENTIFIER NULL,
    CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_ContentPages_CreatedAtUtc DEFAULT SYSUTCDATETIME(),
    UpdatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_ContentPages_UpdatedAtUtc DEFAULT SYSUTCDATETIME()
  );
END
GO

IF OBJECT_ID('dbo.ContentPageRevisions', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.ContentPageRevisions (
    ContentPageRevisionId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_ContentPageRevisions PRIMARY KEY,
    ContentPageId UNIQUEIDENTIFIER NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Slug NVARCHAR(180) NOT NULL,
    Summary NVARCHAR(500) NULL,
    Content NVARCHAR(MAX) NOT NULL,
    ContentFormat VARCHAR(30) NOT NULL,
    PageStatus VARCHAR(30) NOT NULL,
    RevisionNote NVARCHAR(500) NULL,
    CreatedByUserId UNIQUEIDENTIFIER NULL,
    CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_ContentPageRevisions_CreatedAtUtc DEFAULT SYSUTCDATETIME()
  );
END
GO

IF OBJECT_ID('dbo.SeoMetadata', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.SeoMetadata (
    SeoMetadataId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_SeoMetadata PRIMARY KEY,
    EntityType VARCHAR(40) NOT NULL,
    EntityId UNIQUEIDENTIFIER NULL,
    Path NVARCHAR(500) NULL,
    MetaTitle NVARCHAR(70) NOT NULL,
    MetaDescription NVARCHAR(170) NOT NULL,
    CanonicalUrl NVARCHAR(1000) NULL,
    RobotsDirective VARCHAR(80) NULL,
    OgTitle NVARCHAR(100) NULL,
    OgDescription NVARCHAR(220) NULL,
    OgImageUrl NVARCHAR(1000) NULL,
    CreatedByUserId UNIQUEIDENTIFIER NULL,
    UpdatedByUserId UNIQUEIDENTIFIER NULL,
    CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_SeoMetadata_CreatedAtUtc DEFAULT SYSUTCDATETIME(),
    UpdatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_SeoMetadata_UpdatedAtUtc DEFAULT SYSUTCDATETIME()
  );
END
GO

IF OBJECT_ID('dbo.FeaturedProducts', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.FeaturedProducts (
    FeaturedProductId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_FeaturedProducts PRIMARY KEY,
    ProductId UNIQUEIDENTIFIER NOT NULL,
    SectionKey NVARCHAR(80) NOT NULL CONSTRAINT DF_FeaturedProducts_Section DEFAULT ('home-featured'),
    DisplayOrder INT NOT NULL CONSTRAINT DF_FeaturedProducts_DisplayOrder DEFAULT (0),
    FeaturedStatus VARCHAR(30) NOT NULL CONSTRAINT DF_FeaturedProducts_Status DEFAULT ('DRAFT'),
    StartAtUtc DATETIME2 NULL,
    EndAtUtc DATETIME2 NULL,
    CreatedByUserId UNIQUEIDENTIFIER NULL,
    UpdatedByUserId UNIQUEIDENTIFIER NULL,
    CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_FeaturedProducts_CreatedAtUtc DEFAULT SYSUTCDATETIME(),
    UpdatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_FeaturedProducts_UpdatedAtUtc DEFAULT SYSUTCDATETIME()
  );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_ContentPages_Slug' AND object_id = OBJECT_ID(N'dbo.ContentPages'))
  CREATE UNIQUE INDEX UX_ContentPages_Slug ON dbo.ContentPages(Slug);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_SeoMetadata_Path' AND object_id = OBJECT_ID(N'dbo.SeoMetadata'))
  CREATE UNIQUE INDEX UX_SeoMetadata_Path ON dbo.SeoMetadata(Path) WHERE Path IS NOT NULL;
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_SeoMetadata_Entity' AND object_id = OBJECT_ID(N'dbo.SeoMetadata'))
  CREATE UNIQUE INDEX UX_SeoMetadata_Entity ON dbo.SeoMetadata(EntityType, EntityId) WHERE EntityId IS NOT NULL;
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_FeaturedProducts_Section_Product' AND object_id = OBJECT_ID(N'dbo.FeaturedProducts'))
  CREATE UNIQUE INDEX UX_FeaturedProducts_Section_Product ON dbo.FeaturedProducts(SectionKey, ProductId);
GO
