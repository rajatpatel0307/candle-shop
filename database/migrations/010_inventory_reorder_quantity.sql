-- Preserve existing stock while enabling replenishment settings in the admin UI.
IF COL_LENGTH('dbo.Inventory', 'ReorderQuantity') IS NULL
BEGIN
  ALTER TABLE dbo.Inventory ADD ReorderQuantity int NOT NULL
    CONSTRAINT DF_Inventory_ReorderQuantity DEFAULT (0) WITH VALUES;
  EXEC('ALTER TABLE dbo.Inventory ADD CONSTRAINT CK_Inventory_ReorderQuantity CHECK (ReorderQuantity >= 0)');
END;
