IF COL_LENGTH('dbo.StoreSettings', 'Description') IS NULL
  ALTER TABLE dbo.StoreSettings ADD Description nvarchar(500) NULL;
IF COL_LENGTH('dbo.StoreSettings', 'IsPublic') IS NULL
  ALTER TABLE dbo.StoreSettings ADD IsPublic bit NOT NULL CONSTRAINT DF_StoreSettings_IsPublic DEFAULT (0) WITH VALUES;
ALTER TABLE dbo.StoreSettings ALTER COLUMN SettingValue nvarchar(max) NULL;
