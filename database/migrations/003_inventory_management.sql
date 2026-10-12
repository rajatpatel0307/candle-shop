/*
  Module 3 inventory management additive migration.
  Run after the baseline candle e-commerce schema.
  This script preserves the existing Inventory, InventoryMovements, and InventoryReservations tables.
*/

IF OBJECT_ID('dbo.Inventory', 'U') IS NULL
  THROW 51000, 'dbo.Inventory table does not exist. Run the baseline schema first.', 1;

IF OBJECT_ID('dbo.InventoryMovements', 'U') IS NULL
  THROW 51000, 'dbo.InventoryMovements table does not exist. Run the baseline schema first.', 1;

IF OBJECT_ID('dbo.InventoryReservations', 'U') IS NULL
  THROW 51000, 'dbo.InventoryReservations table does not exist. Run the baseline schema first.', 1;
GO

IF COL_LENGTH('dbo.Inventory', 'ReorderQuantity') IS NULL
BEGIN
  ALTER TABLE dbo.Inventory
    ADD ReorderQuantity INT NOT NULL CONSTRAINT DF_Inventory_ReorderQuantity DEFAULT (0);
END
GO

IF COL_LENGTH('dbo.InventoryMovements', 'PreviousOnHandQuantity') IS NULL
BEGIN
  ALTER TABLE dbo.InventoryMovements
    ADD PreviousOnHandQuantity INT NULL;
END
GO

IF COL_LENGTH('dbo.InventoryMovements', 'NewOnHandQuantity') IS NULL
BEGIN
  ALTER TABLE dbo.InventoryMovements
    ADD NewOnHandQuantity INT NULL;
END
GO

IF COL_LENGTH('dbo.InventoryMovements', 'IdempotencyKey') IS NULL
BEGIN
  ALTER TABLE dbo.InventoryMovements
    ADD IdempotencyKey UNIQUEIDENTIFIER NULL;
END
GO

IF COL_LENGTH('dbo.InventoryReservations', 'IdempotencyKey') IS NULL
BEGIN
  ALTER TABLE dbo.InventoryReservations
    ADD IdempotencyKey UNIQUEIDENTIFIER NULL;
END
GO

IF COL_LENGTH('dbo.InventoryReservations', 'ReleasedAtUtc') IS NULL
BEGIN
  ALTER TABLE dbo.InventoryReservations
    ADD ReleasedAtUtc DATETIME2 NULL;
END
GO

IF COL_LENGTH('dbo.InventoryReservations', 'ConfirmedAtUtc') IS NULL
BEGIN
  ALTER TABLE dbo.InventoryReservations
    ADD ConfirmedAtUtc DATETIME2 NULL;
END
GO

IF COL_LENGTH('dbo.InventoryReservations', 'CreatedByUserId') IS NULL
BEGIN
  ALTER TABLE dbo.InventoryReservations
    ADD CreatedByUserId UNIQUEIDENTIFIER NULL;
END
GO

IF COL_LENGTH('dbo.InventoryReservations', 'UpdatedAtUtc') IS NULL
BEGIN
  ALTER TABLE dbo.InventoryReservations
    ADD UpdatedAtUtc DATETIME2 NOT NULL CONSTRAINT DF_InventoryReservations_UpdatedAtUtc DEFAULT SYSUTCDATETIME();
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_Inventory_NonNegative_Quantities')
BEGIN
  ALTER TABLE dbo.Inventory WITH CHECK ADD CONSTRAINT CK_Inventory_NonNegative_Quantities
    CHECK (OnHandQuantity >= 0 AND ReservedQuantity >= 0 AND ReservedQuantity <= OnHandQuantity AND ReorderLevel >= 0 AND ReorderQuantity >= 0);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_InventoryReservations_Positive_Quantity')
BEGIN
  ALTER TABLE dbo.InventoryReservations WITH CHECK ADD CONSTRAINT CK_InventoryReservations_Positive_Quantity
    CHECK (Quantity > 0);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Inventory_LowStock' AND object_id = OBJECT_ID(N'dbo.Inventory'))
BEGIN
  CREATE INDEX IX_Inventory_LowStock
    ON dbo.Inventory(AvailableQuantity, ReorderLevel)
    INCLUDE (ProductVariantId, OnHandQuantity, ReservedQuantity, ReorderQuantity);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_InventoryMovements_Variant_Date' AND object_id = OBJECT_ID(N'dbo.InventoryMovements'))
BEGIN
  CREATE INDEX IX_InventoryMovements_Variant_Date
    ON dbo.InventoryMovements(ProductVariantId, CreatedAtUtc DESC)
    INCLUDE (MovementType, QuantityChange, ReferenceType, ReferenceId, CreatedByUserId);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_InventoryMovements_IdempotencyKey' AND object_id = OBJECT_ID(N'dbo.InventoryMovements'))
BEGIN
  CREATE UNIQUE INDEX UX_InventoryMovements_IdempotencyKey
    ON dbo.InventoryMovements(IdempotencyKey)
    WHERE IdempotencyKey IS NOT NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_InventoryReservations_Active_Expiry' AND object_id = OBJECT_ID(N'dbo.InventoryReservations'))
BEGIN
  CREATE INDEX IX_InventoryReservations_Active_Expiry
    ON dbo.InventoryReservations(ReservationStatus, ExpiresAtUtc)
    INCLUDE (InventoryReservationId, ProductVariantId, Quantity);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_InventoryReservations_IdempotencyKey' AND object_id = OBJECT_ID(N'dbo.InventoryReservations'))
BEGIN
  CREATE UNIQUE INDEX UX_InventoryReservations_IdempotencyKey
    ON dbo.InventoryReservations(IdempotencyKey)
    WHERE IdempotencyKey IS NOT NULL;
END
GO
