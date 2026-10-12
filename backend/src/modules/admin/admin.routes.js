import { Router } from 'express';
import { AppError } from '../../common/errors/AppError.js';
import { databaseSchemaError, databaseUnavailableError, isDatabaseConnectionError, isDatabaseSchemaError } from '../../common/errors/databaseErrors.js';
import { asyncHandler } from '../../common/middleware/asyncHandler.js';
import { getResource, resources } from './resource.config.js';
import { createResource, deleteResource, getResourceById, listResources, updateResource } from './resource.repository.js';

const router = Router();

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
    if (!isDatabaseConnectionError(error)) throw error;
    throw databaseUnavailableError(error);
  }
}));

router.get('/resources/:resource/:id', asyncHandler(async (req, res) => {
  const resource = resolveResource(req);
  let item;
  try {
    item = await getResourceById(resource, parseId(resource, req.params.id));
  } catch (error) {
    if (isDatabaseSchemaError(error)) throw databaseSchemaError(error);
    if (!isDatabaseConnectionError(error)) throw error;
    throw databaseUnavailableError(error);
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
    if (!isDatabaseConnectionError(error)) throw error;
    throw databaseUnavailableError(error);
  }
  res.status(201).json({ data: item });
}));

router.put('/resources/:resource/:id', asyncHandler(async (req, res) => {
  const resource = resolveResource(req);
  let item;
  try {
    item = await updateResource(resource, parseId(resource, req.params.id), req.body);
  } catch (error) {
    if (isDatabaseSchemaError(error)) throw databaseSchemaError(error);
    if (!isDatabaseConnectionError(error)) throw error;
    throw databaseUnavailableError(error);
  }
  if (!item) throw new AppError(404, 'ROW_NOT_FOUND', 'Record was not found.');
  res.json({ data: item });
}));

router.delete('/resources/:resource/:id', asyncHandler(async (req, res) => {
  const resource = resolveResource(req);
  let deleted;
  try {
    deleted = await deleteResource(resource, parseId(resource, req.params.id));
  } catch (error) {
    if (isDatabaseSchemaError(error)) throw databaseSchemaError(error);
    if (!isDatabaseConnectionError(error)) throw error;
    throw databaseUnavailableError(error);
  }
  if (!deleted) throw new AppError(404, 'ROW_NOT_FOUND', 'Record was not found.');
  res.status(204).send();
}));

export default router;
