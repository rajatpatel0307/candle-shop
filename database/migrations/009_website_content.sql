/*
  Module 9 website content additive migration.
  Creates managed content tables without replacing existing product, category, media, or store settings data.
*/

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

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_HomepageBanners_Status')
  ALTER TABLE dbo.HomepageBanners WITH CHECK ADD CONSTRAINT CK_HomepageBanners_Status CHECK (BannerStatus IN ('DRAFT', 'PUBLISHED', 'ARCHIVED'));
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_HomepageBanners_DateRange')
  ALTER TABLE dbo.HomepageBanners WITH CHECK ADD CONSTRAINT CK_HomepageBanners_DateRange CHECK (EndAtUtc IS NULL OR StartAtUtc IS NULL OR EndAtUtc >= StartAtUtc);
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_PromotionalSections_Status')
  ALTER TABLE dbo.PromotionalSections WITH CHECK ADD CONSTRAINT CK_PromotionalSections_Status CHECK (SectionStatus IN ('DRAFT', 'PUBLISHED', 'ARCHIVED'));
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_PromotionalSections_Layout')
  ALTER TABLE dbo.PromotionalSections WITH CHECK ADD CONSTRAINT CK_PromotionalSections_Layout CHECK (LayoutType IN ('IMAGE_LEFT', 'IMAGE_RIGHT', 'FULL_WIDTH', 'TEXT_ONLY'));
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_PromotionalSections_DateRange')
  ALTER TABLE dbo.PromotionalSections WITH CHECK ADD CONSTRAINT CK_PromotionalSections_DateRange CHECK (EndAtUtc IS NULL OR StartAtUtc IS NULL OR EndAtUtc >= StartAtUtc);
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_ContentPages_Status')
  ALTER TABLE dbo.ContentPages WITH CHECK ADD CONSTRAINT CK_ContentPages_Status CHECK (PageStatus IN ('DRAFT', 'PUBLISHED', 'ARCHIVED'));
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_ContentPages_Format')
  ALTER TABLE dbo.ContentPages WITH CHECK ADD CONSTRAINT CK_ContentPages_Format CHECK (ContentFormat IN ('HTML', 'MARKDOWN', 'JSON_BLOCKS'));
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_ContentPages_Type')
  ALTER TABLE dbo.ContentPages WITH CHECK ADD CONSTRAINT CK_ContentPages_Type CHECK (PageType IN ('ABOUT', 'CONTACT', 'TERMS', 'PRIVACY', 'CUSTOM'));
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_SeoMetadata_EntityType')
  ALTER TABLE dbo.SeoMetadata WITH CHECK ADD CONSTRAINT CK_SeoMetadata_EntityType CHECK (EntityType IN ('PAGE', 'PRODUCT', 'CATEGORY', 'PATH'));
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_FeaturedProducts_Status')
  ALTER TABLE dbo.FeaturedProducts WITH CHECK ADD CONSTRAINT CK_FeaturedProducts_Status CHECK (FeaturedStatus IN ('DRAFT', 'PUBLISHED', 'ARCHIVED'));
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_FeaturedProducts_DateRange')
  ALTER TABLE dbo.FeaturedProducts WITH CHECK ADD CONSTRAINT CK_FeaturedProducts_DateRange CHECK (EndAtUtc IS NULL OR StartAtUtc IS NULL OR EndAtUtc >= StartAtUtc);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_ContentPageRevisions_ContentPages')
  ALTER TABLE dbo.ContentPageRevisions WITH CHECK ADD CONSTRAINT FK_ContentPageRevisions_ContentPages FOREIGN KEY (ContentPageId) REFERENCES dbo.ContentPages(ContentPageId);
GO

IF OBJECT_ID('dbo.Products', 'U') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_FeaturedProducts_Products')
  ALTER TABLE dbo.FeaturedProducts WITH CHECK ADD CONSTRAINT FK_FeaturedProducts_Products FOREIGN KEY (ProductId) REFERENCES dbo.Products(ProductId);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_HomepageBanners_Public' AND object_id = OBJECT_ID(N'dbo.HomepageBanners'))
  CREATE INDEX IX_HomepageBanners_Public ON dbo.HomepageBanners(BannerStatus, DisplayOrder, StartAtUtc, EndAtUtc);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_PromotionalSections_Public' AND object_id = OBJECT_ID(N'dbo.PromotionalSections'))
  CREATE INDEX IX_PromotionalSections_Public ON dbo.PromotionalSections(SectionStatus, DisplayOrder, StartAtUtc, EndAtUtc);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_ContentPages_Slug' AND object_id = OBJECT_ID(N'dbo.ContentPages'))
  CREATE UNIQUE INDEX UX_ContentPages_Slug ON dbo.ContentPages(Slug);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_ContentPages_Public' AND object_id = OBJECT_ID(N'dbo.ContentPages'))
  CREATE INDEX IX_ContentPages_Public ON dbo.ContentPages(Slug, PageStatus, PublishedAtUtc);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_ContentPageRevisions_Page_Date' AND object_id = OBJECT_ID(N'dbo.ContentPageRevisions'))
  CREATE INDEX IX_ContentPageRevisions_Page_Date ON dbo.ContentPageRevisions(ContentPageId, CreatedAtUtc DESC);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_SeoMetadata_Entity' AND object_id = OBJECT_ID(N'dbo.SeoMetadata'))
  CREATE UNIQUE INDEX UX_SeoMetadata_Entity ON dbo.SeoMetadata(EntityType, EntityId) WHERE EntityId IS NOT NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_SeoMetadata_Path' AND object_id = OBJECT_ID(N'dbo.SeoMetadata'))
  CREATE UNIQUE INDEX UX_SeoMetadata_Path ON dbo.SeoMetadata(Path) WHERE Path IS NOT NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_FeaturedProducts_Section_Product' AND object_id = OBJECT_ID(N'dbo.FeaturedProducts'))
  CREATE UNIQUE INDEX UX_FeaturedProducts_Section_Product ON dbo.FeaturedProducts(SectionKey, ProductId);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_FeaturedProducts_Public' AND object_id = OBJECT_ID(N'dbo.FeaturedProducts'))
  CREATE INDEX IX_FeaturedProducts_Public ON dbo.FeaturedProducts(SectionKey, FeaturedStatus, DisplayOrder, StartAtUtc, EndAtUtc);
GO
