export const fallbackCategories = [
  {
    CategoryId: 1,
    CategoryName: 'Signature Candles',
    Slug: 'signature-candles',
    Description: 'Core candle collections for daily rituals.',
    ImageUrl: null,
  },
  {
    CategoryId: 2,
    CategoryName: 'Gift Sets',
    Slug: 'gift-sets',
    Description: 'Curated bundles for celebrations and hosting.',
    ImageUrl: null,
  },
  {
    CategoryId: 3,
    CategoryName: 'Accessories',
    Slug: 'accessories',
    Description: 'Trimmers, snuffers, holders, and care tools.',
    ImageUrl: null,
  },
];

export const fallbackProducts = [
  {
    ProductId: 'sample-1',
    ProductName: 'Amber Ritual Candle',
    Slug: 'amber-ritual-candle',
    ShortDescription: 'Warm amber, sandalwood, and a quiet evening glow.',
    SellingPrice: 1199,
    CompareAtPrice: 1499,
    CategoryName: 'Signature Candles',
    CategorySlug: 'signature-candles',
    BrandName: 'Candle Studio',
    ImageUrl: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=80',
  },
  {
    ProductId: 'sample-2',
    ProductName: 'Cedar Smoke Jar',
    Slug: 'cedar-smoke-jar',
    ShortDescription: 'Cedar, clove, and clean smoke for cooler nights.',
    SellingPrice: 999,
    CompareAtPrice: null,
    CategoryName: 'Wood Wick',
    CategorySlug: 'wood-wick',
    BrandName: 'Candle Studio',
    ImageUrl: 'https://images.unsplash.com/photo-1602524206684-4b8a87c86a8b?auto=format&fit=crop&w=900&q=80',
  },
  {
    ProductId: 'sample-3',
    ProductName: 'Citrus Linen Tin',
    Slug: 'citrus-linen-tin',
    ShortDescription: 'Bright citrus folded into fresh linen and soft musk.',
    SellingPrice: 799,
    CompareAtPrice: null,
    CategoryName: 'Travel Tins',
    CategorySlug: 'travel-tins',
    BrandName: 'Candle Studio',
    ImageUrl: 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=900&q=80',
  },
];

export function fallbackHomeData() {
  return {
    banners: [],
    categories: fallbackCategories,
    featuredProducts: fallbackProducts,
    isFallback: true,
  };
}

export function fallbackProduct(slug) {
  const product = fallbackProducts.find((item) => item.Slug === slug);
  if (!product) return null;

  return {
    ...product,
    Description: product.ShortDescription,
    ProductType: 'Candle',
    IsFeatured: true,
    images: [{ ImageUrl: product.ImageUrl, AltText: product.ProductName, DisplayOrder: 0, IsPrimary: true }],
    variants: [{
      ProductVariantId: `${product.ProductId}-variant`,
      SKU: product.Slug.toUpperCase(),
      VariantName: 'Default',
      SellingPrice: product.SellingPrice,
      CompareAtPrice: product.CompareAtPrice,
      AvailableQuantity: 12,
    }],
    specifications: [],
    reviews: [],
    isFallback: true,
  };
}
