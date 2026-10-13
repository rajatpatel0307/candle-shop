import { randomUUID } from 'node:crypto';
import { getPool, sql } from '../../config/database.js';

export function resolveRange(input = {}) {
  const now = new Date();
  const startOfDay = (date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  let from;
  let to = now;
  switch (input.range) {
    case 'today':
      from = startOfDay(now);
      break;
    case 'last7':
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'currentMonth':
      from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      break;
    case 'previousMonth':
      from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
      to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      break;
    case 'custom':
      from = input.from;
      to = input.to;
      break;
    case 'last30':
    default:
      from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
  }
  return { from, to };
}

function bindRange(request, range) {
  request.input('from', sql.DateTime2, range.from);
  request.input('to', sql.DateTime2, range.to);
}

export async function summary(input) {
  const range = resolveRange(input);
  const pool = await getPool();
  const request = pool.request();
  bindRange(request, range);
  const result = await request.query(`
    SELECT
      COUNT(1) AS TotalOrders,
      SUM(CASE WHEN PaymentStatus = 'SUCCEEDED' THEN 1 ELSE 0 END) AS SuccessfulOrders,
      SUM(CASE WHEN OrderStatus = 'PENDING_PAYMENT' THEN 1 ELSE 0 END) AS PendingOrders,
      SUM(CASE WHEN OrderStatus = 'CANCELLED' THEN 1 ELSE 0 END) AS CancelledOrders,
      COALESCE(SUM(CASE WHEN PaymentStatus = 'SUCCEEDED' THEN GrandTotal ELSE 0 END), 0) AS GrossSales,
      COALESCE(SUM(CASE WHEN PaymentStatus = 'SUCCEEDED' THEN DiscountAmount ELSE 0 END), 0) AS Discounts,
      COALESCE(SUM(CASE WHEN PaymentStatus = 'SUCCEEDED' THEN TaxAmount ELSE 0 END), 0) AS TaxCollected,
      COALESCE(SUM(CASE WHEN PaymentStatus = 'SUCCEEDED' THEN ShippingAmount ELSE 0 END), 0) AS ShippingRevenue,
      COALESCE(AVG(CASE WHEN PaymentStatus = 'SUCCEEDED' THEN GrandTotal END), 0) AS AverageOrderValue
    FROM dbo.Orders
    WHERE CreatedAtUtc >= @from AND CreatedAtUtc < @to;

    SELECT COALESCE(SUM(RefundAmount), 0) AS RefundTotal
    FROM dbo.Refunds
    WHERE RefundStatus IN ('SUCCEEDED', 'PROCESSING') AND CreatedAtUtc >= @from AND CreatedAtUtc < @to;
  `);
  const metrics = result.recordsets[0][0] || {};
  const refundTotal = Number(result.recordsets[1][0]?.RefundTotal || 0);
  return { ...metrics, RefundTotal: refundTotal, NetSales: Number(metrics.GrossSales || 0) - refundTotal, range };
}

export async function timeSeries(input, metric = 'revenue') {
  const range = resolveRange(input);
  const pool = await getPool();
  const request = pool.request();
  bindRange(request, range);
  const amountExpr = metric === 'orders' ? 'COUNT(1)' : "COALESCE(SUM(CASE WHEN PaymentStatus = 'SUCCEEDED' THEN GrandTotal ELSE 0 END), 0)";
  const result = await request.query(`
    SELECT CONVERT(date, CreatedAtUtc) AS Bucket, ${amountExpr} AS Value
    FROM dbo.Orders
    WHERE CreatedAtUtc >= @from AND CreatedAtUtc < @to
    GROUP BY CONVERT(date, CreatedAtUtc)
    ORDER BY Bucket ASC;
  `);
  return result.recordset;
}

export async function orderStatus(input) {
  const range = resolveRange(input);
  const pool = await getPool();
  const request = pool.request();
  bindRange(request, range);
  const result = await request.query(`
    SELECT OrderStatus AS Status, COUNT(1) AS Count
    FROM dbo.Orders
    WHERE CreatedAtUtc >= @from AND CreatedAtUtc < @to
    GROUP BY OrderStatus
    ORDER BY Count DESC;
  `);
  return result.recordset;
}

export async function topProducts(input) {
  const range = resolveRange(input);
  const pool = await getPool();
  const request = pool.request();
  bindRange(request, range);
  const result = await request.query(`
    SELECT TOP 10 oi.ProductNameSnapshot, oi.SKU, SUM(oi.Quantity) AS UnitsSold, SUM(oi.LineTotal) AS Sales
    FROM dbo.OrderItems oi
    INNER JOIN dbo.Orders o ON o.OrderId = oi.OrderId
    WHERE o.PaymentStatus = 'SUCCEEDED' AND o.OrderStatus <> 'CANCELLED'
      AND o.CreatedAtUtc >= @from AND o.CreatedAtUtc < @to
    GROUP BY oi.ProductNameSnapshot, oi.SKU
    ORDER BY UnitsSold DESC, Sales DESC;
  `);
  return result.recordset;
}

export async function lowStock(limit = 10) {
  const pool = await getPool();
  const result = await pool.request().input('limit', sql.Int, limit).query(`
    SELECT TOP (@limit) inv.ProductVariantId, inv.OnHandQuantity, inv.ReservedQuantity, inv.AvailableQuantity,
      inv.ReorderLevel, p.ProductName, v.SKU, v.VariantName
    FROM dbo.Inventory inv
    INNER JOIN dbo.ProductVariants v ON v.ProductVariantId = inv.ProductVariantId
    INNER JOIN dbo.Products p ON p.ProductId = v.ProductId
    WHERE inv.AvailableQuantity <= inv.ReorderLevel
    ORDER BY inv.AvailableQuantity ASC, p.ProductName ASC;
  `);
  return result.recordset;
}

export async function recentOrders(limit = 10) {
  const pool = await getPool();
  const result = await pool.request().input('limit', sql.Int, limit).query(`
    SELECT TOP (@limit) o.OrderId, o.OrderNumber, o.OrderStatus, o.PaymentStatus, o.GrandTotal, o.CurrencyCode, o.CreatedAtUtc,
      u.Email, u.FirstName, u.LastName
    FROM dbo.Orders o
    LEFT JOIN dbo.Users u ON u.UserId = o.UserId
    ORDER BY o.CreatedAtUtc DESC;
  `);
  return result.recordset;
}

export async function recentActivity(limit = 20) {
  const pool = await getPool();
  const result = await pool.request().input('limit', sql.Int, limit).query(`
    SELECT TOP (@limit) a.*, u.Email
    FROM dbo.AuditLogs a
    LEFT JOIN dbo.Users u ON u.UserId = a.ActorUserId
    ORDER BY a.CreatedAtUtc DESC;
  `);
  return result.recordset;
}

export async function inventoryOverview() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT
      COUNT(1) AS TotalRecords,
      COALESCE(SUM(OnHandQuantity), 0) AS TotalOnHand,
      COALESCE(SUM(ReservedQuantity), 0) AS TotalReserved,
      COALESCE(SUM(AvailableQuantity), 0) AS TotalAvailable,
      SUM(CASE WHEN AvailableQuantity > 0 AND AvailableQuantity <= ReorderLevel THEN 1 ELSE 0 END) AS LowStockItems,
      SUM(CASE WHEN AvailableQuantity <= 0 THEN 1 ELSE 0 END) AS OutOfStockItems
    FROM dbo.Inventory;
  `);
  return result.recordset[0];
}

export async function simpleCount(tableName) {
  const allowed = new Set(['Products', 'Categories', 'Brands', 'Fragrances', 'Users', 'Orders']);
  if (!allowed.has(tableName)) throw new Error('Unsafe table name.');
  const pool = await getPool();
  const result = await pool.request().query(`SELECT COUNT(1) AS Count FROM dbo.${tableName};`);
  return Number(result.recordset[0]?.Count || 0);
}

export async function salesReport(input) {
  const range = resolveRange(input);
  const pool = await getPool();
  const request = pool.request();
  bindRange(request, range);
  const result = await request.query(`
    SELECT OrderNumber, OrderStatus, PaymentStatus, CurrencyCode, SubtotalAmount, DiscountAmount, TaxAmount, ShippingAmount, GrandTotal, CreatedAtUtc
    FROM dbo.Orders
    WHERE CreatedAtUtc >= @from AND CreatedAtUtc < @to
    ORDER BY CreatedAtUtc DESC;
  `);
  return result.recordset;
}

export async function productReport(input) {
  return topProducts(input);
}

export async function refundReport(input) {
  const range = resolveRange(input);
  const pool = await getPool();
  const request = pool.request();
  bindRange(request, range);
  const result = await request.query(`
    SELECT r.*, o.OrderNumber
    FROM dbo.Refunds r
    INNER JOIN dbo.Orders o ON o.OrderId = r.OrderId
    WHERE r.CreatedAtUtc >= @from AND r.CreatedAtUtc < @to
    ORDER BY r.CreatedAtUtc DESC;
  `);
  return result.recordset;
}

export async function listAuditLogs(query) {
  const pool = await getPool();
  const request = pool.request()
    .input('limit', sql.Int, query.limit)
    .input('offset', sql.Int, (query.page - 1) * query.limit);
  const where = ['1 = 1'];
  if (query.search) {
    request.input('search', sql.NVarChar(180), `%${query.search}%`);
    where.push('(ActionName LIKE @search OR EntityName LIKE @search OR Outcome LIKE @search)');
  }
  const result = await request.query(`
    SELECT a.*, u.Email, COUNT(1) OVER() AS TotalRows
    FROM dbo.AuditLogs a
    LEFT JOIN dbo.Users u ON u.UserId = a.ActorUserId
    WHERE ${where.join(' AND ')}
    ORDER BY a.CreatedAtUtc DESC
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
  `);
  return { rows: result.recordset.map(({ TotalRows, ...row }) => row), total: Number(result.recordset[0]?.TotalRows || 0) };
}

export async function getAuditLog(id) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.UniqueIdentifier, id)
    .query('SELECT TOP 1 * FROM dbo.AuditLogs WHERE AuditLogId = @id;');
  return result.recordset[0] ?? null;
}

export async function insertAuditLog({ userId, action, entityName, entityId, outcome = 'SUCCESS', details, req }) {
  const pool = await getPool();
  await pool.request()
    .input('id', sql.UniqueIdentifier, randomUUID())
    .input('userId', sql.UniqueIdentifier, userId ?? null)
    .input('action', sql.NVarChar(150), action)
    .input('entityName', sql.NVarChar(100), entityName)
    .input('entityId', sql.UniqueIdentifier, entityId ?? null)
    .input('outcome', sql.VarChar(30), outcome)
    .input('ip', sql.VarChar(45), req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || req?.socket?.remoteAddress || null)
    .input('agent', sql.NVarChar(500), req?.headers?.['user-agent'] ?? null)
    .input('correlation', sql.NVarChar(100), req?.id ?? null)
    .input('details', sql.NVarChar(sql.MAX), details ? JSON.stringify(details) : null)
    .query(`
      INSERT INTO dbo.AuditLogs (AuditLogId, ActorUserId, ActionName, EntityName, EntityId, Outcome, IpAddress, UserAgent, CorrelationId, DetailsJson)
      VALUES (@id, @userId, @action, @entityName, @entityId, @outcome, @ip, @agent, @correlation, @details);
    `);
}

export async function listCustomers({ search, limit = 50, offset = 0 } = {}) {
  const pool = await getPool();
  const request = pool.request()
    .input('limit', sql.Int, Math.min(Number(limit) || 50, 200))
    .input('offset', sql.Int, Math.max(Number(offset) || 0, 0));
  const where = [
    'u.IsDeleted = 0',
    `EXISTS (
      SELECT 1
      FROM dbo.UserRoles cur
      INNER JOIN dbo.Roles cr ON cr.RoleId = cur.RoleId
      WHERE cur.UserId = u.UserId AND cr.RoleCode = N'CUSTOMER'
    )`,
    `NOT EXISTS (
      SELECT 1
      FROM dbo.UserRoles sur
      INNER JOIN dbo.Roles sr ON sr.RoleId = sur.RoleId
      WHERE sur.UserId = u.UserId AND sr.RoleCode IN (N'ADMIN', N'SUPPORT')
    )`,
  ];

  if (search) {
    request.input('search', sql.NVarChar(300), `%${search}%`);
    where.push('(u.FirstName LIKE @search OR u.LastName LIKE @search OR u.Email LIKE @search OR u.PhoneNumber LIKE @search)');
  }

  const result = await request.query(`
    SELECT
      u.UserId, u.FirstName, u.LastName, u.Email, u.PhoneNumber, u.AccountStatus,
      u.EmailVerifiedAtUtc, u.LastLoginAtUtc, u.CreatedAtUtc,
      COUNT(DISTINCT o.OrderId) AS OrderCount,
      COALESCE(SUM(CASE WHEN o.PaymentStatus = 'SUCCEEDED' THEN o.GrandTotal ELSE 0 END), 0) AS LifetimeValue
    FROM dbo.Users u
    LEFT JOIN dbo.Orders o ON o.UserId = u.UserId
    WHERE ${where.join(' AND ')}
    GROUP BY u.UserId, u.FirstName, u.LastName, u.Email, u.PhoneNumber, u.AccountStatus,
      u.EmailVerifiedAtUtc, u.LastLoginAtUtc, u.CreatedAtUtc
    ORDER BY u.CreatedAtUtc DESC
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
  `);

  return result.recordset;
}

export async function getCustomerDetails(userId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('userId', sql.UniqueIdentifier, userId)
    .query(`
      SELECT
        u.UserId, u.FirstName, u.LastName, u.Email, u.PhoneNumber, u.AccountStatus,
        u.EmailVerifiedAtUtc, u.LastLoginAtUtc, u.CreatedAtUtc, u.UpdatedAtUtc,
        STRING_AGG(r.RoleCode, ',') AS Roles
      FROM dbo.Users u
      INNER JOIN dbo.UserRoles ur ON ur.UserId = u.UserId
      INNER JOIN dbo.Roles r ON r.RoleId = ur.RoleId
      WHERE u.UserId = @userId AND u.IsDeleted = 0
      GROUP BY u.UserId, u.FirstName, u.LastName, u.Email, u.PhoneNumber, u.AccountStatus,
        u.EmailVerifiedAtUtc, u.LastLoginAtUtc, u.CreatedAtUtc, u.UpdatedAtUtc
      HAVING
        SUM(CASE WHEN r.RoleCode = N'CUSTOMER' THEN 1 ELSE 0 END) > 0
        AND SUM(CASE WHEN r.RoleCode IN (N'ADMIN', N'SUPPORT') THEN 1 ELSE 0 END) = 0;

      SELECT AddressId, AddressLabel, RecipientName, PhoneNumber, AddressLine1, AddressLine2,
        Locality, City, StateOrProvince, PostalCode, CountryCode, IsDefaultShipping, IsDefaultBilling, CreatedAtUtc
      FROM dbo.UserAddresses
      WHERE UserId = @userId
      ORDER BY IsDefaultShipping DESC, CreatedAtUtc DESC;

      SELECT TOP 10 OrderId, OrderNumber, OrderStatus, PaymentStatus, GrandTotal, CurrencyCode, CreatedAtUtc
      FROM dbo.Orders
      WHERE UserId = @userId
      ORDER BY CreatedAtUtc DESC;

      SELECT
        COUNT(1) AS TotalOrders,
        COALESCE(SUM(CASE WHEN PaymentStatus = 'SUCCEEDED' THEN GrandTotal ELSE 0 END), 0) AS LifetimeValue,
        MAX(CreatedAtUtc) AS LastOrderAtUtc
      FROM dbo.Orders
      WHERE UserId = @userId;
    `);

  const customer = result.recordsets[0][0] ?? null;
  if (!customer) return null;

  return {
    customer: {
      ...customer,
      roles: customer.Roles ? customer.Roles.split(',').filter(Boolean) : [],
    },
    addresses: result.recordsets[1] || [],
    orders: result.recordsets[2] || [],
    summary: result.recordsets[3][0] || {},
  };
}

export async function listSettings() {
  const pool = await getPool();
  const result = await pool.request().query('SELECT * FROM dbo.StoreSettings ORDER BY SettingKey ASC;');
  return result.recordset;
}

export async function getSetting(key) {
  const pool = await getPool();
  const result = await pool.request()
    .input('key', sql.NVarChar(150), key)
    .query('SELECT TOP 1 * FROM dbo.StoreSettings WHERE SettingKey = @key;');
  return result.recordset[0] ?? null;
}

export async function upsertSetting(input, userId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.UniqueIdentifier, randomUUID())
    .input('key', sql.NVarChar(150), input.settingKey)
    .input('value', sql.NVarChar(sql.MAX), serializeSettingValue(input.settingValue, input.valueType))
    .input('type', sql.VarChar(30), input.valueType)
    .input('description', sql.NVarChar(500), input.description ?? null)
    .input('isPublic', sql.Bit, input.isPublic)
    .input('userId', sql.UniqueIdentifier, userId ?? null)
    .query(`
      MERGE dbo.StoreSettings AS target
      USING (SELECT @key AS SettingKey) AS source
      ON target.SettingKey = source.SettingKey
      WHEN MATCHED THEN UPDATE SET
        SettingValue = @value,
        ValueType = @type,
        Description = COALESCE(@description, Description),
        IsPublic = @isPublic,
        UpdatedByUserId = @userId,
        UpdatedAtUtc = SYSUTCDATETIME()
      WHEN NOT MATCHED THEN INSERT (StoreSettingId, SettingKey, SettingValue, ValueType, Description, IsPublic, UpdatedByUserId)
        VALUES (@id, @key, @value, @type, @description, @isPublic, @userId)
      OUTPUT inserted.*;
    `);
  return result.recordset[0];
}

function serializeSettingValue(value, type) {
  if (type === 'json') return JSON.stringify(value ?? null);
  if (type === 'boolean') return value ? 'true' : 'false';
  if (type === 'number') return String(Number(value ?? 0));
  return value === undefined || value === null ? null : String(value);
}
