import { getPool } from '../../config/database.js';
import { AppError } from '../../common/errors/AppError.js';

// Only these fixed statements may be selected by a route parameter.
const summaries = {
  customers: `SELECT COUNT(*) AS total, COUNT(CASE WHEN u.AccountStatus='Active' THEN 1 END) AS active, COUNT(CASE WHEN u.AccountStatus<>'Active' THEN 1 END) AS inactive, COUNT(CASE WHEN u.EmailVerifiedAtUtc IS NOT NULL THEN 1 END) AS verified FROM dbo.Users u WHERE u.IsDeleted=0 AND EXISTS (SELECT 1 FROM dbo.UserRoles ur JOIN dbo.Roles r ON r.RoleId=ur.RoleId WHERE ur.UserId=u.UserId AND r.RoleCode='CUSTOMER') AND NOT EXISTS (SELECT 1 FROM dbo.UserRoles ur JOIN dbo.Roles r ON r.RoleId=ur.RoleId WHERE ur.UserId=u.UserId AND r.RoleCode IN ('ADMIN','SUPPORT'))`,
  reviews: `SELECT COUNT(*) AS total, COUNT(CASE WHEN ReviewStatus='APPROVED' THEN 1 END) AS published, COUNT(CASE WHEN ReviewStatus='HIDDEN' THEN 1 END) AS hidden, COUNT(CASE WHEN ReviewStatus='REJECTED' THEN 1 END) AS removed FROM dbo.ProductReviews`,
  tickets: `SELECT COUNT(*) AS total, COUNT(CASE WHEN TicketStatus='OPEN' THEN 1 END) AS openTickets, COUNT(CASE WHEN TicketStatus='IN_PROGRESS' THEN 1 END) AS inProgress, COUNT(CASE WHEN TicketStatus='WAITING_FOR_CUSTOMER' THEN 1 END) AS waiting, COUNT(CASE WHEN TicketStatus IN ('RESOLVED','CLOSED') THEN 1 END) AS completed FROM dbo.SupportTickets`,
  notifications: `SELECT COUNT(*) AS total, COUNT(CASE WHEN ReadAtUtc IS NOT NULL THEN 1 END) AS readCount, COUNT(CASE WHEN ReadAtUtc IS NULL THEN 1 END) AS unread, COUNT(DISTINCT UserId) AS recipients FROM dbo.Notifications`,
  banners: `SELECT COUNT(*) AS total, COUNT(CASE WHEN BannerStatus='PUBLISHED' THEN 1 END) AS published, COUNT(CASE WHEN BannerStatus='DRAFT' THEN 1 END) AS draft, COUNT(CASE WHEN BannerStatus='ARCHIVED' THEN 1 END) AS archived FROM dbo.HomepageBanners`,
  'shipping-settings': `SELECT (SELECT COUNT(*) FROM dbo.ShippingRates) AS total, (SELECT COUNT(*) FROM dbo.ShippingRates WHERE IsActive=1) AS active, (SELECT COUNT(*) FROM dbo.ShippingZones) AS zones, (SELECT COUNT(*) FROM dbo.ShippingMethods) AS methods`,
  settings: `SELECT COUNT(*) AS total, COUNT(CASE WHEN IsPublic=1 THEN 1 END) AS publicCount, COUNT(CASE WHEN IsPublic=0 THEN 1 END) AS privateCount, COUNT(CASE WHEN ValueType='json' THEN 1 END) AS jsonCount FROM dbo.StoreSettings`,
  products: `SELECT COUNT(*) AS total, COUNT(CASE WHEN ProductStatus='Active' THEN 1 END) AS active, COUNT(CASE WHEN ProductStatus='Draft' THEN 1 END) AS draft, COUNT(CASE WHEN ProductStatus='Archived' THEN 1 END) AS archived, COUNT(CASE WHEN IsFeatured=1 THEN 1 END) AS featured FROM dbo.Products`,
  categories: `SELECT COUNT(*) AS total, COUNT(CASE WHEN IsActive=1 THEN 1 END) AS active, COUNT(CASE WHEN IsActive=0 THEN 1 END) AS inactive, COUNT(CASE WHEN ParentCategoryId IS NULL THEN 1 END) AS topLevel FROM dbo.Categories`,
  brands: `SELECT COUNT(*) AS total, COUNT(CASE WHEN IsActive=1 THEN 1 END) AS active, COUNT(CASE WHEN IsActive=0 THEN 1 END) AS inactive, COUNT(CASE WHEN NULLIF(LTRIM(RTRIM(LogoUrl)),'') IS NOT NULL THEN 1 END) AS withLogo FROM dbo.Brands`,
  orders: `SELECT COUNT(*) AS total, COUNT(CASE WHEN OrderStatus IN ('CONFIRMED','PROCESSING','READY_TO_SHIP') THEN 1 END) AS processing, COUNT(CASE WHEN OrderStatus='SHIPPED' THEN 1 END) AS shipped, COUNT(CASE WHEN OrderStatus='DELIVERED' THEN 1 END) AS delivered, COUNT(CASE WHEN OrderStatus='CANCELLED' THEN 1 END) AS cancelled FROM dbo.Orders`,
  refunds: `SELECT COUNT(*) AS total, COUNT(CASE WHEN RefundStatus IN ('PENDING','APPROVED') THEN 1 END) AS pending, COUNT(CASE WHEN RefundStatus='PROCESSING' THEN 1 END) AS processing, COUNT(CASE WHEN RefundStatus='SUCCEEDED' THEN 1 END) AS succeeded, COUNT(CASE WHEN RefundStatus='FAILED' THEN 1 END) AS failed FROM dbo.Refunds`,
  shipments: `SELECT COUNT(*) AS total, COUNT(CASE WHEN ShipmentStatus IN ('CREATED','LABEL_CREATED') THEN 1 END) AS awaiting, COUNT(CASE WHEN ShipmentStatus IN ('PICKED_UP','IN_TRANSIT','OUT_FOR_DELIVERY') THEN 1 END) AS inTransit, COUNT(CASE WHEN ShipmentStatus='DELIVERED' THEN 1 END) AS delivered, COUNT(CASE WHEN ShipmentStatus IN ('DELIVERY_FAILED','RETURN_TO_SENDER') THEN 1 END) AS exceptions FROM dbo.Shipments`,
  'audit-logs': `SELECT COUNT(*) AS total, COUNT(CASE WHEN Outcome='SUCCESS' THEN 1 END) AS success, COUNT(CASE WHEN Outcome='FAILURE' THEN 1 END) AS failure, COUNT(CASE WHEN Outcome='DENIED' THEN 1 END) AS denied FROM dbo.AuditLogs`,
};

export async function getListSummary(section) {
  if (!Object.hasOwn(summaries, section)) throw new AppError(404, 'SUMMARY_NOT_FOUND', 'This summary is not available.');
  const pool = await getPool();
  const result = await pool.request().query(summaries[section]);
  return result.recordset[0];
}
