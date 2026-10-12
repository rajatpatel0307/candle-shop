export const routeGroups = {
  public: ['/', '/shop', '/categories', '/products/:slug', '/contact', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email'],
  account: ['/account', '/sessions', '/account/orders', '/account/addresses', '/account/wishlist'],
  commerce: ['/cart', '/checkout', '/orders', '/wishlist'],
  admin: ['/admin', '/admin/inventory-dashboard', '/admin/inventory', '/admin/inventory/:productVariantId', '/admin/inventory-movements', '/admin/inventory-reservations', '/admin/:resourceKey'],
};
