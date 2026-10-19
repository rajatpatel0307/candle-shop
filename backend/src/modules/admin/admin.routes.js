import { Router, raw } from 'express';
import { uploadImage } from './admin.media.service.js';
import { getPool, sql } from '../../config/database.js';
import { getListSummary } from './admin.list-summary.js';
import * as audit from './admin.audit.service.js';
import { AppError } from '../../common/errors/AppError.js';
import { databaseRequestError, databaseSchemaError, databaseUnavailableError, isDatabaseConnectionError, isDatabaseRequestError, isDatabaseSchemaError } from '../../common/errors/databaseErrors.js';
import { asyncHandler } from '../../common/middleware/asyncHandler.js';
import { authenticate } from '../auth/auth.middleware.js';
import {
  auditLog,
  auditLogs,
  dashboardLowStock,
  dashboardOrders,
  dashboardRecentActivity,
  dashboardRecentOrders,
  dashboardRevenue,
  dashboardSales,
  dashboardSummary,
  dashboardTopProducts,
  customerDetails,
  customers,
  getSetting,
  listSettings,
  overview,
  putSetting,
  putSettings,
  report,
} from './admin.controller.js';
import { requireAdminAccess, requireAdminOnly } from './admin.policy.js';
import { getResource, resources } from './resource.config.js';
import { createResource, deleteResource, getResourceById, listResources, updateResource } from './resource.repository.js';

const router = Router();

router.use(authenticate, requireAdminAccess);

router.get('/product-images/:productId', asyncHandler(async (req,res) => {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(req.params.productId)) throw new AppError(400,'INVALID_PRODUCT_ID','Choose a valid product.');
  const pool=await getPool();
  const result=await pool.request().input('productId',sql.UniqueIdentifier,req.params.productId).query('SELECT * FROM dbo.ProductImages WHERE ProductId=@productId ORDER BY IsPrimary DESC, DisplayOrder, ProductImageId;');
  res.json({data:result.recordset});
}));

router.post('/media/images', raw({ type: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'], limit: '5mb' }), asyncHandler(async (req,res) => {
  const image = await uploadImage(Buffer.isBuffer(req.body) ? {file:req.body,mime:req.get('Content-Type')?.split(';')[0]} : {url:req.body?.url});
  res.status(201).json({data:{image}});
}));

router.get('/list-summaries/:section', (req,res,next) => req.params.section === 'settings' ? requireAdminOnly(req,res,next) : next(), asyncHandler(async (req, res) => {
  res.json({ data: { summary: await getListSummary(req.params.section) } });
}));

router.get('/dashboard/summary', asyncHandler(dashboardSummary));
router.get('/dashboard/sales', asyncHandler(dashboardSales));
router.get('/dashboard/revenue', asyncHandler(dashboardRevenue));
router.get('/dashboard/orders', asyncHandler(dashboardOrders));
router.get('/dashboard/top-products', asyncHandler(dashboardTopProducts));
router.get('/dashboard/low-stock', asyncHandler(dashboardLowStock));
router.get('/dashboard/recent-orders', asyncHandler(dashboardRecentOrders));
router.get('/dashboard/recent-activity', asyncHandler(dashboardRecentActivity));
router.get('/overview/products', asyncHandler(overview));
router.get('/overview/customers', asyncHandler(overview));
router.get('/overview/orders', asyncHandler(overview));
router.get('/overview/inventory', asyncHandler(overview));
router.get('/reports/:type', asyncHandler(report));
router.get('/audit-logs', asyncHandler(auditLogs));
router.get('/audit-logs/:id', asyncHandler(auditLog));
router.get('/customers', asyncHandler(customers));
router.get('/customers/:customerId', asyncHandler(customerDetails));
router.get('/settings', asyncHandler(listSettings));
router.put('/settings', requireAdminOnly, asyncHandler(putSettings));
router.get('/settings/:key', asyncHandler(getSetting));
router.put('/settings/:key', requireAdminOnly, asyncHandler(putSetting));

function resolveResource(req) {
  const resource = getResource(req.params.resource);
  if (!resource) throw new AppError(404, 'RESOURCE_NOT_FOUND', 'Resource is not part of the SQL baseline.');
  return resource;
}

function parseId(resource, value) {
  if (!Array.isArray(resource.id)) return value;
  const parts = value.split(',');
  if (parts.length !== resource.id.length) {
    throw new AppError(400, 'INVALID_COMPOSITE_ID', `Use a comma-separated id with ${resource.id.length} values.`);
  }
  return parts;
}

router.get('/resources', (req, res) => {
  res.json({ data: resources.map(({ key, title, id, list, write }) => ({ key, title, id, list, write })) });
});

router.get('/resources/:resource', asyncHandler(async (req, res) => {
  const resource = resolveResource(req);
  try {
    const data = await listResources(resource, req.query);
    res.json({ data });
  } catch (error) {
    if (isDatabaseSchemaError(error)) throw databaseSchemaError(error);
    if (isDatabaseConnectionError(error)) throw databaseUnavailableError(error);
    if (isDatabaseRequestError(error)) throw databaseRequestError(error);
    throw error;
  }
}));

router.get('/resources/:resource/:id', asyncHandler(async (req, res) => {
  const resource = resolveResource(req);
  let item;
  try {
    item = await getResourceById(resource, parseId(resource, req.params.id));
  } catch (error) {
    if (isDatabaseSchemaError(error)) throw databaseSchemaError(error);
    if (isDatabaseConnectionError(error)) throw databaseUnavailableError(error);
    if (isDatabaseRequestError(error)) throw databaseRequestError(error);
    throw error;
  }
  if (!item) throw new AppError(404, 'ROW_NOT_FOUND', 'Record was not found.');
  res.json({ data: item });
}));

router.post('/resources/:resource', asyncHandler(async (req, res) => {
  const resource = resolveResource(req);
  let item;
  try {
    item = await createResource(resource, req.body);
  } catch (error) {
    if (isDatabaseSchemaError(error)) throw databaseSchemaError(error);
    if (isDatabaseConnectionError(error)) throw databaseUnavailableError(error);
    if (isDatabaseRequestError(error)) throw databaseRequestError(error);
    throw error;
  }
  await audit.record({ userId: req.user.id, action: 'RECORD_CREATE', entityName: resource.table, entityId: Array.isArray(resource.id) ? resource.id.map((key) => item[key]).join(',') : item?.[resource.id], req });
  res.status(201).json({ data: item });
}));

router.put('/resources/:resource/:id', asyncHandler(async (req, res) => {
  const resource = resolveResource(req);
  let item;
  try {
    item = await updateResource(resource, parseId(resource, req.params.id), req.body);
  } catch (error) {
    if (isDatabaseSchemaError(error)) throw databaseSchemaError(error);
    if (isDatabaseConnectionError(error)) throw databaseUnavailableError(error);
    if (isDatabaseRequestError(error)) throw databaseRequestError(error);
    throw error;
  }
  if (!item) throw new AppError(404, 'ROW_NOT_FOUND', 'Record was not found.');
  await audit.record({ userId: req.user.id, action: 'RECORD_UPDATE', entityName: resource.table, entityId: req.params.id, req });
  res.json({ data: item });
}));

router.delete('/resources/:resource/:id', asyncHandler(async (req, res) => {
  const resource = resolveResource(req);
  let deleted;
  try {
    deleted = await deleteResource(resource, parseId(resource, req.params.id));
  } catch (error) {
    if (isDatabaseSchemaError(error)) throw databaseSchemaError(error);
    if (isDatabaseConnectionError(error)) throw databaseUnavailableError(error);
    if (isDatabaseRequestError(error)) throw databaseRequestError(error);
    throw error;
  }
  if (!deleted) throw new AppError(404, 'ROW_NOT_FOUND', 'Record was not found.');
  await audit.record({ userId: req.user.id, action: 'RECORD_DELETE', entityName: resource.table, entityId: req.params.id, req });
  res.status(204).send();
}));

export default router;
