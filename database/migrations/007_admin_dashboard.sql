/*
  Module 7 admin dashboard additive migration.
  Reuses baseline commerce tables and creates missing configuration/audit tables only when absent.
*/

IF OBJECT_ID('dbo.StoreSettings', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.StoreSettings (
    StoreSettingId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_StoreSettings PRIMARY KEY,
    SettingKey NVARCHAR(150) NOT NULL,
    SettingValue NVARCHAR(MAX) NULL,
    ValueType VARCHAR(30) NOT NULL CONSTRAINT DF_StoreSettings_ValueType DEFAULT ('string'),
    Description NVARCHAR(500) NULL,
    IsPublic BIT NOT NULL CONSTRAINT DF_StoreSettings_IsPublic DEFAULT (0),
    IsSensitive BIT NOT NULL CONSTRAINT DF_StoreSettings_IsSensitive DEFAULT (0),
    UpdatedByUserId UNIQUEIDENTIFIER NULL,
    CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_StoreSettings_CreatedAtUtc DEFAULT SYSUTCDATETIME(),
    UpdatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_StoreSettings_UpdatedAtUtc DEFAULT SYSUTCDATETIME()
  );
END
GO

IF OBJECT_ID('dbo.Coupons', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Coupons (
    CouponId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_Coupons PRIMARY KEY,
    CouponCode NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    DiscountType VARCHAR(20) NOT NULL,
    DiscountValue DECIMAL(18,2) NOT NULL,
    MinimumOrderAmount DECIMAL(18,2) NULL,
    MaximumDiscountAmount DECIMAL(18,2) NULL,
    UsageLimit INT NULL,
    UsageLimitPerUser INT NULL,
    StartsAtUtc DATETIME2 NULL,
    EndsAtUtc DATETIME2 NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_Coupons_IsActive DEFAULT (1),
    CreatedByUserId UNIQUEIDENTIFIER NULL,
    CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_Coupons_CreatedAtUtc DEFAULT SYSUTCDATETIME(),
    UpdatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_Coupons_UpdatedAtUtc DEFAULT SYSUTCDATETIME()
  );
END
GO

IF OBJECT_ID('dbo.AuditLogs', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.AuditLogs (
    AuditLogId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_AuditLogs PRIMARY KEY,
    ActorUserId UNIQUEIDENTIFIER NULL,
    ActionName NVARCHAR(150) NOT NULL,
    EntityName NVARCHAR(100) NOT NULL,
    EntityId UNIQUEIDENTIFIER NULL,
    Outcome VARCHAR(30) NOT NULL CONSTRAINT DF_AuditLogs_Outcome DEFAULT ('SUCCESS'),
    IpAddress VARCHAR(45) NULL,
    UserAgent NVARCHAR(500) NULL,
    CorrelationId NVARCHAR(100) NULL,
    DetailsJson NVARCHAR(MAX) NULL,
    CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_AuditLogs_CreatedAtUtc DEFAULT SYSUTCDATETIME()
  );
END
GO

IF OBJECT_ID('dbo.ShippingMethods', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.ShippingMethods (
    ShippingMethodId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_ShippingMethods PRIMARY KEY,
    MethodCode NVARCHAR(100) NOT NULL,
    MethodName NVARCHAR(150) NOT NULL,
    Description NVARCHAR(500) NULL,
    EstimatedMinDays INT NULL,
    EstimatedMaxDays INT NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_ShippingMethods_IsActive DEFAULT (1),
    CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_ShippingMethods_CreatedAtUtc DEFAULT SYSUTCDATETIME(),
    UpdatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_ShippingMethods_UpdatedAtUtc DEFAULT SYSUTCDATETIME()
  );
END
GO

IF OBJECT_ID('dbo.ShippingZones', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.ShippingZones (
    ShippingZoneId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_ShippingZones PRIMARY KEY,
    ZoneName NVARCHAR(150) NOT NULL,
    CountryCode CHAR(2) NOT NULL,
    StateOrProvince NVARCHAR(120) NULL,
    PostalCodePrefix NVARCHAR(20) NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_ShippingZones_IsActive DEFAULT (1),
    CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_ShippingZones_CreatedAtUtc DEFAULT SYSUTCDATETIME(),
    UpdatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_ShippingZones_UpdatedAtUtc DEFAULT SYSUTCDATETIME()
  );
END
GO

IF OBJECT_ID('dbo.ShippingRates', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.ShippingRates (
    ShippingRateId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_ShippingRates PRIMARY KEY,
    ShippingZoneId UNIQUEIDENTIFIER NULL,
    ShippingMethodId UNIQUEIDENTIFIER NULL,
    MinWeightGrams INT NULL,
    MaxWeightGrams INT NULL,
    BaseFee DECIMAL(18,2) NOT NULL CONSTRAINT DF_ShippingRates_BaseFee DEFAULT (0),
    AdditionalPerKgFee DECIMAL(18,2) NULL,
    FreeShippingThreshold DECIMAL(18,2) NULL,
    EffectiveFromUtc DATETIME2 NULL,
    EffectiveToUtc DATETIME2 NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_ShippingRates_IsActive DEFAULT (1),
    CreatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_ShippingRates_CreatedAtUtc DEFAULT SYSUTCDATETIME(),
    UpdatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_ShippingRates_UpdatedAtUtc DEFAULT SYSUTCDATETIME()
  );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_StoreSettings_Key' AND object_id = OBJECT_ID(N'dbo.StoreSettings'))
  CREATE UNIQUE INDEX UX_StoreSettings_Key ON dbo.StoreSettings(SettingKey);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_Coupons_Code' AND object_id = OBJECT_ID(N'dbo.Coupons'))
  CREATE UNIQUE INDEX UX_Coupons_Code ON dbo.Coupons(CouponCode);
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_Coupons_Discount')
  ALTER TABLE dbo.Coupons WITH CHECK ADD CONSTRAINT CK_Coupons_Discount CHECK (DiscountValue >= 0 AND (DiscountType <> 'PERCENT' OR DiscountValue <= 100));
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_AuditLogs_Created' AND object_id = OBJECT_ID(N'dbo.AuditLogs'))
  CREATE INDEX IX_AuditLogs_Created ON dbo.AuditLogs(CreatedAtUtc DESC) INCLUDE (ActorUserId, ActionName, EntityName, EntityId, Outcome);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_AuditLogs_Entity' AND object_id = OBJECT_ID(N'dbo.AuditLogs'))
  CREATE INDEX IX_AuditLogs_Entity ON dbo.AuditLogs(EntityName, EntityId, CreatedAtUtc DESC);
GO

IF NOT EXISTS (SELECT 1 FROM dbo.StoreSettings WHERE SettingKey = N'store.name')
  INSERT INTO dbo.StoreSettings (StoreSettingId, SettingKey, SettingValue, ValueType, Description, IsPublic)
  VALUES (NEWID(), N'store.name', N'Candle Studio', 'string', N'Customer-facing store name.', 1);
GO

IF NOT EXISTS (SELECT 1 FROM dbo.StoreSettings WHERE SettingKey = N'store.currency')
  INSERT INTO dbo.StoreSettings (StoreSettingId, SettingKey, SettingValue, ValueType, Description, IsPublic)
  VALUES (NEWID(), N'store.currency', N'INR', 'string', N'Default storefront currency.', 1);
GO
