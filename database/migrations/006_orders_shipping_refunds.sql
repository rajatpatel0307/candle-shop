/*
  Module 6 orders, shipping, and refunds additive migration.
  Run after baseline schema and Module 5 checkout/payments migration.
*/

IF OBJECT_ID('dbo.Orders', 'U') IS NULL THROW 51000, 'dbo.Orders table does not exist. Run checkout/payments migration first.', 1;
IF OBJECT_ID('dbo.Payments', 'U') IS NULL THROW 51000, 'dbo.Payments table does not exist. Run checkout/payments migration first.', 1;
GO

IF COL_LENGTH('dbo.Orders', 'CancellationReason') IS NULL
  ALTER TABLE dbo.Orders ADD CancellationReason NVARCHAR(500) NULL;
IF COL_LENGTH('dbo.Orders', 'CancelledAtUtc') IS NULL
  ALTER TABLE dbo.Orders ADD CancelledAtUtc DATETIME2 NULL;
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

IF OBJECT_ID('dbo.Shipments', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Shipments (
    ShipmentId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_Shipments PRIMARY KEY,
    OrderId UNIQUEIDENTIFIER NOT NULL,
    ShipmentNumber NVARCHAR(100) NOT NULL,
    CarrierName NVARCHAR(100) NOT NULL,
    CarrierCode NVARCHAR(100) NULL,
    ShippingService NVARCHAR(100) NULL,
    TrackingNumber NVARCHAR(200) NULL,
    TrackingUrl NVARCHAR(1000) NULL,
    ShipmentStatus VARCHAR(30) NOT NULL,
    ShippingCost DECIMAL(18,2) NOT NULL CONSTRAINT DF_Shipments_ShippingCost DEFAULT (0),
    ShippedAtUtc DATETIME2 NULL,
    EstimatedDeliveryAtUtc DATETIME2 NULL,
    DeliveredAtUtc DATETIME2 NULL,
    CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_Shipments_CreatedAtUtc DEFAULT SYSUTCDATETIME(),
    UpdatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_Shipments_UpdatedAtUtc DEFAULT SYSUTCDATETIME()
  );
END
GO

IF OBJECT_ID('dbo.ShipmentTrackingEvents', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.ShipmentTrackingEvents (
    ShipmentTrackingEventId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_ShipmentTrackingEvents PRIMARY KEY,
    ShipmentId UNIQUEIDENTIFIER NOT NULL,
    ProviderEventId NVARCHAR(200) NULL,
    TrackingStatus VARCHAR(30) NOT NULL,
    EventDescription NVARCHAR(500) NULL,
    EventLocation NVARCHAR(200) NULL,
    OccurredAtUtc DATETIME2 NOT NULL,
    ReceivedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_ShipmentTrackingEvents_ReceivedAtUtc DEFAULT SYSUTCDATETIME(),
    CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_ShipmentTrackingEvents_CreatedAtUtc DEFAULT SYSUTCDATETIME(),
    CreatedByUserId UNIQUEIDENTIFIER NULL
  );
END
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

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Orders_Status_Created' AND object_id = OBJECT_ID(N'dbo.Orders'))
  CREATE INDEX IX_Orders_Status_Created ON dbo.Orders(OrderStatus, PaymentStatus, CreatedAtUtc DESC);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_OrderCancellationRequests_Order' AND object_id = OBJECT_ID(N'dbo.OrderCancellationRequests'))
  CREATE INDEX IX_OrderCancellationRequests_Order ON dbo.OrderCancellationRequests(OrderId, RequestedAtUtc DESC);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_Shipments_Number' AND object_id = OBJECT_ID(N'dbo.Shipments'))
  CREATE UNIQUE INDEX UX_Shipments_Number ON dbo.Shipments(ShipmentNumber);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Shipments_Order' AND object_id = OBJECT_ID(N'dbo.Shipments'))
  CREATE INDEX IX_Shipments_Order ON dbo.Shipments(OrderId, CreatedAtUtc DESC);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_ShipmentTrackingEvents_Provider' AND object_id = OBJECT_ID(N'dbo.ShipmentTrackingEvents'))
  CREATE UNIQUE INDEX UX_ShipmentTrackingEvents_Provider ON dbo.ShipmentTrackingEvents(ShipmentId, ProviderEventId) WHERE ProviderEventId IS NOT NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_ShipmentTrackingEvents_Shipment' AND object_id = OBJECT_ID(N'dbo.ShipmentTrackingEvents'))
  CREATE INDEX IX_ShipmentTrackingEvents_Shipment ON dbo.ShipmentTrackingEvents(ShipmentId, OccurredAtUtc DESC);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_Refunds_Number' AND object_id = OBJECT_ID(N'dbo.Refunds'))
  CREATE UNIQUE INDEX UX_Refunds_Number ON dbo.Refunds(RefundNumber);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_Refunds_Idempotency' AND object_id = OBJECT_ID(N'dbo.Refunds'))
  CREATE UNIQUE INDEX UX_Refunds_Idempotency ON dbo.Refunds(IdempotencyKey) WHERE IdempotencyKey IS NOT NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Refunds_Order' AND object_id = OBJECT_ID(N'dbo.Refunds'))
  CREATE INDEX IX_Refunds_Order ON dbo.Refunds(OrderId, CreatedAtUtc DESC);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_ShippingWebhookEvents_Provider_Event' AND object_id = OBJECT_ID(N'dbo.ShippingWebhookEvents'))
  CREATE UNIQUE INDEX UX_ShippingWebhookEvents_Provider_Event ON dbo.ShippingWebhookEvents(Provider, ProviderEventId);
GO
