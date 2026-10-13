import * as dashboard from './admin.dashboard.service.js';
import * as metrics from './admin.metrics.service.js';
import * as reports from './admin.reports.service.js';
import * as audit from './admin.audit.service.js';
import * as settings from './admin.settings.service.js';
import { auditLogIdSchema, dateRangeSchema, listQuerySchema, settingKeySchema, settingsBulkSchema, settingUpsertSchema } from './admin.validation.js';
import { ok, validate } from '../carts/carts.utils.js';

export async function dashboardSummary(req, res) {
  ok(res, 'Dashboard summary loaded.', { summary: await dashboard.summary(validate(dateRangeSchema, req.query)) });
}
export async function dashboardSales(req, res) {
  ok(res, 'Dashboard sales loaded.', { sales: await dashboard.sales(validate(dateRangeSchema, req.query)) });
}
export async function dashboardRevenue(req, res) {
  ok(res, 'Dashboard revenue loaded.', { revenue: await dashboard.revenue(validate(dateRangeSchema, req.query)) });
}
export async function dashboardOrders(req, res) {
  ok(res, 'Dashboard orders loaded.', { orders: await dashboard.orders(validate(dateRangeSchema, req.query)) });
}
export async function dashboardTopProducts(req, res) {
  ok(res, 'Top products loaded.', { products: await dashboard.topProducts(validate(dateRangeSchema, req.query)) });
}
export async function dashboardLowStock(req, res) {
  ok(res, 'Low stock loaded.', { items: await dashboard.lowStock() });
}
export async function dashboardRecentOrders(req, res) {
  ok(res, 'Recent orders loaded.', { orders: await dashboard.recentOrders() });
}
export async function dashboardRecentActivity(req, res) {
  ok(res, 'Recent activity loaded.', { activity: await dashboard.recentActivity() });
}
export async function overview(req, res) {
  ok(res, 'Admin overview loaded.', { overview: await metrics.managementOverview() });
}
export async function report(req, res) {
  const query = validate(listQuerySchema, req.query);
  const type = req.params.type;
  const handlers = { sales: reports.sales, revenue: reports.revenue, orders: reports.orders, products: reports.products, inventory: reports.inventory, refunds: reports.refunds };
  const rows = await (handlers[type] || reports.sales)(query);
  if (req.query.format === 'csv') {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-report.csv"`);
    res.send(reports.toCsv(rows));
    return;
  }
  ok(res, 'Report loaded.', { report: { type, rows } });
}
export async function auditLogs(req, res) {
  ok(res, 'Audit logs loaded.', { auditLogs: await audit.list(validate(listQuerySchema, req.query)) });
}
export async function auditLog(req, res) {
  const { id } = validate(auditLogIdSchema, req.params);
  ok(res, 'Audit log loaded.', { auditLog: await audit.get(id) });
}
export async function listSettings(req, res) {
  ok(res, 'Settings loaded.', { settings: await settings.list() });
}
export async function getSetting(req, res) {
  const { key } = validate(settingKeySchema, req.params);
  ok(res, 'Setting loaded.', { setting: await settings.get(key) });
}
export async function putSettings(req, res) {
  ok(res, 'Settings updated.', { settings: await settings.bulkUpsert(validate(settingsBulkSchema, req.body), req.user.id, req) });
}
export async function putSetting(req, res) {
  const { key } = validate(settingKeySchema, req.params);
  ok(res, 'Setting updated.', { setting: await settings.upsert({ ...validate(settingUpsertSchema, req.body), settingKey: key }, req.user.id, req) });
}
