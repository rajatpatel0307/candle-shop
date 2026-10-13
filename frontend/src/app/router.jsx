export const routeGroups = {
  public: ['/', '/shop', '/categories', '/products/:slug', '/contact', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email'],
  account: ['/account', '/sessions', '/account/orders', '/account/addresses', '/account/wishlist'],
  commerce: ['/cart', '/checkout', '/payments/result', '/orders', '/orders/:orderId', '/orders/:orderId/tracking', '/orders/:orderId/confirmation', '/wishlist'],
  admin: ['/admin', '/admin/dashboard', '/admin/products', '/admin/categories', '/admin/brands', '/admin/fragrances', '/admin/customers', '/admin/customers/:customerId', '/admin/coupons', '/admin/shipping-settings', '/admin/settings', '/admin/reports', '/admin/audit-logs', '/admin/orders', '/admin/orders/:orderId', '/admin/shipments', '/admin/refunds', '/admin/inventory-dashboard', '/admin/inventory', '/admin/inventory/:productVariantId', '/admin/inventory-movements', '/admin/inventory-reservations', '/admin/resources', '/admin/:resourceKey'],
};
