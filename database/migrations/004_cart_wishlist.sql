/*
  Module 4 cart and wishlist additive migration.
  Run after the baseline candle e-commerce schema.
  Preserves existing Carts, CartItems, Wishlists, and WishlistItems tables.
*/

IF OBJECT_ID('dbo.Carts', 'U') IS NULL
  THROW 51000, 'dbo.Carts table does not exist. Run the baseline schema first.', 1;

IF OBJECT_ID('dbo.CartItems', 'U') IS NULL
  THROW 51000, 'dbo.CartItems table does not exist. Run the baseline schema first.', 1;

IF OBJECT_ID('dbo.Wishlists', 'U') IS NULL
  THROW 51000, 'dbo.Wishlists table does not exist. Run the baseline schema first.', 1;

IF OBJECT_ID('dbo.WishlistItems', 'U') IS NULL
  THROW 51000, 'dbo.WishlistItems table does not exist. Run the baseline schema first.', 1;
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_CartItems_Positive_Quantity')
BEGIN
  ALTER TABLE dbo.CartItems WITH CHECK ADD CONSTRAINT CK_CartItems_Positive_Quantity
    CHECK (Quantity > 0);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_Carts_User_Active' AND object_id = OBJECT_ID(N'dbo.Carts'))
BEGIN
  CREATE UNIQUE INDEX UX_Carts_User_Active
    ON dbo.Carts(UserId)
    WHERE UserId IS NOT NULL AND CartStatus = N'ACTIVE';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_CartItems_Cart_Variant' AND object_id = OBJECT_ID(N'dbo.CartItems'))
BEGIN
  CREATE UNIQUE INDEX UX_CartItems_Cart_Variant
    ON dbo.CartItems(CartId, ProductVariantId);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_CartItems_Cart' AND object_id = OBJECT_ID(N'dbo.CartItems'))
BEGIN
  CREATE INDEX IX_CartItems_Cart
    ON dbo.CartItems(CartId)
    INCLUDE (ProductVariantId, Quantity, UpdatedAtUtc);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_Wishlists_User_DefaultName' AND object_id = OBJECT_ID(N'dbo.Wishlists'))
BEGIN
  CREATE UNIQUE INDEX UX_Wishlists_User_DefaultName
    ON dbo.Wishlists(UserId, WishlistName);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_WishlistItems_Wishlist_ProductVariant' AND object_id = OBJECT_ID(N'dbo.WishlistItems'))
BEGIN
  CREATE UNIQUE INDEX UX_WishlistItems_Wishlist_ProductVariant
    ON dbo.WishlistItems(WishlistId, ProductId, ProductVariantId)
    WHERE ProductVariantId IS NOT NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_WishlistItems_Wishlist_Product' AND object_id = OBJECT_ID(N'dbo.WishlistItems'))
BEGIN
  CREATE UNIQUE INDEX UX_WishlistItems_Wishlist_Product
    ON dbo.WishlistItems(WishlistId, ProductId)
    WHERE ProductVariantId IS NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_WishlistItems_Wishlist' AND object_id = OBJECT_ID(N'dbo.WishlistItems'))
BEGIN
  CREATE INDEX IX_WishlistItems_Wishlist
    ON dbo.WishlistItems(WishlistId)
    INCLUDE (ProductId, ProductVariantId, AddedAtUtc);
END
GO
