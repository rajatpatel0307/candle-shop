/*
  Module 5 checkout and payments additive migration.
  Run after the baseline schema plus inventory/cart migrations.
  The script preserves baseline commerce tables and adds missing safety columns,
  constraints, and indexes needed for idempotent checkout and payment processing.
*/

IF OBJECT_ID('dbo.Carts', 'U') IS NULL THROW 51000, 'dbo.Carts table does not exist. Run the baseline schema first.', 1;
IF OBJECT_ID('dbo.CartItems', 'U') IS NULL THROW 51000, 'dbo.CartItems table does not exist. Run the baseline schema first.', 1;
IF OBJECT_ID('dbo.UserAddresses', 'U') IS NULL THROW 51000, 'dbo.UserAddresses table does not exist. Run the baseline schema first.', 1;
IF OBJECT_ID('dbo.InventoryReservations', 'U') IS NULL THROW 51000, 'dbo.InventoryReservations table does not exist. Run inventory migration first.', 1;
GO

IF OBJECT_ID('dbo.CheckoutSessions', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.CheckoutSessions (
    CheckoutSessionId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_CheckoutSessions PRIMARY KEY,
    CartId UNIQUEIDENTIFIER NOT NULL,
    UserId UNIQUEIDENTIFIER NOT NULL,
    SessionStatus VARCHAR(30) NOT NULL CONSTRAINT DF_CheckoutSessions_Status DEFAULT ('ACTIVE'),
    ShippingAddressId UNIQUEIDENTIFIER NULL,
    BillingAddressId UNIQUEIDENTIFIER NULL,
    ShippingMethodId UNIQUEIDENTIFIER NULL,
    CouponCode NVARCHAR(50) NULL,
    IdempotencyKey UNIQUEIDENTIFIER NULL,
    RequestHash CHAR(64) NULL,
    OrderId UNIQUEIDENTIFIER NULL,
    CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_CheckoutSessions_CreatedAtUtc DEFAULT SYSUTCDATETIME(),
    UpdatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_CheckoutSessions_UpdatedAtUtc DEFAULT SYSUTCDATETIME(),
    ExpiresAtUtc DATETIME2 NULL
  );
END
GO

IF OBJECT_ID('dbo.Orders', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Orders (
    OrderId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_Orders PRIMARY KEY,
    OrderNumber NVARCHAR(30) NOT NULL,
    UserId UNIQUEIDENTIFIER NOT NULL,
    CartId UNIQUEIDENTIFIER NULL,
    CurrencyCode CHAR(3) NOT NULL,
    OrderStatus VARCHAR(30) NOT NULL,
    PaymentStatus VARCHAR(30) NOT NULL,
    SubtotalAmount DECIMAL(18,2) NOT NULL CONSTRAINT DF_Orders_Subtotal DEFAULT (0),
    DiscountAmount DECIMAL(18,2) NOT NULL CONSTRAINT DF_Orders_Discount DEFAULT (0),
    ShippingAmount DECIMAL(18,2) NOT NULL CONSTRAINT DF_Orders_Shipping DEFAULT (0),
    TaxAmount DECIMAL(18,2) NOT NULL CONSTRAINT DF_Orders_Tax DEFAULT (0),
    GrandTotal DECIMAL(18,2) NOT NULL CONSTRAINT DF_Orders_Total DEFAULT (0),
    IdempotencyKey UNIQUEIDENTIFIER NULL,
    CustomerEmail NVARCHAR(320) NULL,
    CustomerPhone NVARCHAR(30) NULL,
    Notes NVARCHAR(1000) NULL,
    CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_Orders_CreatedAtUtc DEFAULT SYSUTCDATETIME(),
    UpdatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_Orders_UpdatedAtUtc DEFAULT SYSUTCDATETIME()
  );
END
GO

IF OBJECT_ID('dbo.OrderItems', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.OrderItems (
    OrderItemId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_OrderItems PRIMARY KEY,
    OrderId UNIQUEIDENTIFIER NOT NULL,
    ProductVariantId UNIQUEIDENTIFIER NOT NULL,
    SKU NVARCHAR(100) NULL,
    ProductNameSnapshot NVARCHAR(200) NOT NULL,
    VariantNameSnapshot NVARCHAR(200) NULL,
    UnitPrice DECIMAL(18,2) NOT NULL,
    Quantity INT NOT NULL,
    DiscountAmount DECIMAL(18,2) NOT NULL CONSTRAINT DF_OrderItems_Discount DEFAULT (0),
    TaxAmount DECIMAL(18,2) NOT NULL CONSTRAINT DF_OrderItems_Tax DEFAULT (0),
    LineTotal DECIMAL(18,2) NOT NULL,
    CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_OrderItems_CreatedAtUtc DEFAULT SYSUTCDATETIME()
  );
END
GO

IF OBJECT_ID('dbo.OrderAddresses', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.OrderAddresses (
    OrderAddressId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_OrderAddresses PRIMARY KEY,
    OrderId UNIQUEIDENTIFIER NOT NULL,
    AddressType VARCHAR(20) NOT NULL,
    RecipientName NVARCHAR(150) NOT NULL,
    PhoneNumber NVARCHAR(30) NULL,
    AddressLine1 NVARCHAR(200) NOT NULL,
    AddressLine2 NVARCHAR(200) NULL,
    Locality NVARCHAR(120) NULL,
    City NVARCHAR(120) NOT NULL,
    StateOrProvince NVARCHAR(120) NULL,
    PostalCode NVARCHAR(20) NOT NULL,
    CountryCode CHAR(2) NOT NULL,
    CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_OrderAddresses_CreatedAtUtc DEFAULT SYSUTCDATETIME()
  );
END
GO

IF OBJECT_ID('dbo.OrderStatusHistory', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.OrderStatusHistory (
    OrderStatusHistoryId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_OrderStatusHistory PRIMARY KEY,
    OrderId UNIQUEIDENTIFIER NOT NULL,
    OldStatus VARCHAR(30) NULL,
    NewStatus VARCHAR(30) NOT NULL,
    ChangedByUserId UNIQUEIDENTIFIER NULL,
    Notes NVARCHAR(500) NULL,
    ChangedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_OrderStatusHistory_ChangedAtUtc DEFAULT SYSUTCDATETIME()
  );
END
GO

IF OBJECT_ID('dbo.Payments', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Payments (
    PaymentId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_Payments PRIMARY KEY,
    OrderId UNIQUEIDENTIFIER NOT NULL,
    PaymentProvider VARCHAR(50) NOT NULL,
    ProviderPaymentId NVARCHAR(200) NULL,
    ProviderOrderId NVARCHAR(200) NULL,
    PaymentStatus VARCHAR(30) NOT NULL,
    IdempotencyKey UNIQUEIDENTIFIER NULL,
    Amount DECIMAL(18,2) NOT NULL,
    CurrencyCode CHAR(3) NOT NULL,
    FailureCode NVARCHAR(100) NULL,
    FailureReason NVARCHAR(500) NULL,
    CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_Payments_CreatedAtUtc DEFAULT SYSUTCDATETIME(),
    UpdatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_Payments_UpdatedAtUtc DEFAULT SYSUTCDATETIME(),
    PaidAtUtc DATETIME2 NULL
  );
END
GO

IF OBJECT_ID('dbo.PaymentAttempts', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.PaymentAttempts (
    PaymentAttemptId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_PaymentAttempts PRIMARY KEY,
    OrderId UNIQUEIDENTIFIER NOT NULL,
    PaymentId UNIQUEIDENTIFIER NULL,
    PaymentProvider VARCHAR(50) NOT NULL,
    AttemptStatus VARCHAR(30) NOT NULL,
    ProviderReference NVARCHAR(200) NULL,
    ErrorCode NVARCHAR(100) NULL,
    ErrorMessage NVARCHAR(500) NULL,
    CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_PaymentAttempts_CreatedAtUtc DEFAULT SYSUTCDATETIME(),
    UpdatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_PaymentAttempts_UpdatedAtUtc DEFAULT SYSUTCDATETIME()
  );
END
GO

IF OBJECT_ID('dbo.PaymentWebhookEvents', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.PaymentWebhookEvents (
    PaymentWebhookEventId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_PaymentWebhookEvents PRIMARY KEY,
    PaymentProvider VARCHAR(50) NOT NULL,
    ProviderEventId NVARCHAR(200) NOT NULL,
    EventType NVARCHAR(150) NOT NULL,
    ProcessingStatus VARCHAR(30) NOT NULL,
    PayloadJson NVARCHAR(MAX) NULL,
    ReceivedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_PaymentWebhookEvents_ReceivedAtUtc DEFAULT SYSUTCDATETIME(),
    ProcessedAtUtc DATETIME2 NULL,
    AttemptCount INT NOT NULL CONSTRAINT DF_PaymentWebhookEvents_AttemptCount DEFAULT (0),
    ProcessingError NVARCHAR(1000) NULL
  );
END
GO

IF COL_LENGTH('dbo.CheckoutSessions', 'IdempotencyKey') IS NULL ALTER TABLE dbo.CheckoutSessions ADD IdempotencyKey UNIQUEIDENTIFIER NULL;
IF COL_LENGTH('dbo.CheckoutSessions', 'RequestHash') IS NULL ALTER TABLE dbo.CheckoutSessions ADD RequestHash CHAR(64) NULL;
IF COL_LENGTH('dbo.CheckoutSessions', 'OrderId') IS NULL ALTER TABLE dbo.CheckoutSessions ADD OrderId UNIQUEIDENTIFIER NULL;
IF COL_LENGTH('dbo.CheckoutSessions', 'CouponCode') IS NULL ALTER TABLE dbo.CheckoutSessions ADD CouponCode NVARCHAR(50) NULL;
IF COL_LENGTH('dbo.CheckoutSessions', 'UpdatedAtUtc') IS NULL ALTER TABLE dbo.CheckoutSessions ADD UpdatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_CheckoutSessions_UpdatedAtUtc_Added DEFAULT SYSUTCDATETIME();
GO

IF COL_LENGTH('dbo.Orders', 'IdempotencyKey') IS NULL ALTER TABLE dbo.Orders ADD IdempotencyKey UNIQUEIDENTIFIER NULL;
IF COL_LENGTH('dbo.Payments', 'IdempotencyKey') IS NULL ALTER TABLE dbo.Payments ADD IdempotencyKey UNIQUEIDENTIFIER NULL;
IF COL_LENGTH('dbo.Payments', 'ProviderOrderId') IS NULL ALTER TABLE dbo.Payments ADD ProviderOrderId NVARCHAR(200) NULL;
IF COL_LENGTH('dbo.Payments', 'FailureCode') IS NULL ALTER TABLE dbo.Payments ADD FailureCode NVARCHAR(100) NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_Orders_NonNegative_Amounts')
  ALTER TABLE dbo.Orders WITH CHECK ADD CONSTRAINT CK_Orders_NonNegative_Amounts CHECK (SubtotalAmount >= 0 AND DiscountAmount >= 0 AND ShippingAmount >= 0 AND TaxAmount >= 0 AND GrandTotal >= 0);
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_OrderItems_Positive_Quantity')
  ALTER TABLE dbo.OrderItems WITH CHECK ADD CONSTRAINT CK_OrderItems_Positive_Quantity CHECK (Quantity > 0 AND UnitPrice >= 0 AND DiscountAmount >= 0 AND TaxAmount >= 0 AND LineTotal >= 0);
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_Payments_NonNegative_Amount')
  ALTER TABLE dbo.Payments WITH CHECK ADD CONSTRAINT CK_Payments_NonNegative_Amount CHECK (Amount >= 0);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_Orders_OrderNumber' AND object_id = OBJECT_ID(N'dbo.Orders'))
  CREATE UNIQUE INDEX UX_Orders_OrderNumber ON dbo.Orders(OrderNumber);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_Orders_IdempotencyKey' AND object_id = OBJECT_ID(N'dbo.Orders'))
  CREATE UNIQUE INDEX UX_Orders_IdempotencyKey ON dbo.Orders(IdempotencyKey) WHERE IdempotencyKey IS NOT NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Orders_User_Created' AND object_id = OBJECT_ID(N'dbo.Orders'))
  CREATE INDEX IX_Orders_User_Created ON dbo.Orders(UserId, CreatedAtUtc DESC) INCLUDE (OrderNumber, OrderStatus, PaymentStatus, GrandTotal);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_OrderItems_Order' AND object_id = OBJECT_ID(N'dbo.OrderItems'))
  CREATE INDEX IX_OrderItems_Order ON dbo.OrderItems(OrderId);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_CheckoutSessions_User_Status' AND object_id = OBJECT_ID(N'dbo.CheckoutSessions'))
  CREATE INDEX IX_CheckoutSessions_User_Status ON dbo.CheckoutSessions(UserId, SessionStatus, CreatedAtUtc DESC);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_CheckoutSessions_User_Idempotency' AND object_id = OBJECT_ID(N'dbo.CheckoutSessions'))
  CREATE UNIQUE INDEX UX_CheckoutSessions_User_Idempotency ON dbo.CheckoutSessions(UserId, IdempotencyKey) WHERE IdempotencyKey IS NOT NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Payments_Order' AND object_id = OBJECT_ID(N'dbo.Payments'))
  CREATE INDEX IX_Payments_Order ON dbo.Payments(OrderId, CreatedAtUtc DESC);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_Payments_ProviderOrder' AND object_id = OBJECT_ID(N'dbo.Payments'))
  CREATE UNIQUE INDEX UX_Payments_ProviderOrder ON dbo.Payments(PaymentProvider, ProviderOrderId) WHERE ProviderOrderId IS NOT NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_Payments_ProviderPayment' AND object_id = OBJECT_ID(N'dbo.Payments'))
  CREATE UNIQUE INDEX UX_Payments_ProviderPayment ON dbo.Payments(PaymentProvider, ProviderPaymentId) WHERE ProviderPaymentId IS NOT NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_PaymentWebhookEvents_Provider_Event' AND object_id = OBJECT_ID(N'dbo.PaymentWebhookEvents'))
  CREATE UNIQUE INDEX UX_PaymentWebhookEvents_Provider_Event ON dbo.PaymentWebhookEvents(PaymentProvider, ProviderEventId);
GO
