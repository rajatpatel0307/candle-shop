import { getPool, sql } from '../../config/database.js';

const identifierPattern = /^[A-Za-z][A-Za-z0-9_]*$/;

function quoteIdentifier(identifier) {
  if (!identifierPattern.test(identifier)) {
    throw new Error(`Unsafe SQL identifier: ${identifier}`);
  }
  return `[${identifier}]`;
}

function tableName(resource) {
  return `[dbo].${quoteIdentifier(resource.table)}`;
}

function bindValue(request, name, value) {
  if (typeof value === 'number') return request.input(name, sql.Decimal(19, 4), value);
  if (typeof value === 'boolean') return request.input(name, sql.Bit, value);
  if (value instanceof Date) return request.input(name, sql.DateTime2, value);
  return request.input(name, value ?? null);
}

function idColumns(resource) {
  return Array.isArray(resource.id) ? resource.id : [resource.id];
}

function addIdWhere(request, resource, idValues) {
  const values = Array.isArray(idValues) ? idValues : [idValues];
  return idColumns(resource).map((column, index) => {
    bindValue(request, `id${index}`, values[index]);
    return `${quoteIdentifier(column)} = @id${index}`;
  }).join(' AND ');
}

function writablePayload(resource, body) {
  return resource.write.reduce((payload, column) => {
    if (Object.prototype.hasOwnProperty.call(body, column)) payload[column] = body[column];
    return payload;
  }, {});
}

export async function listResources(resource, { search, limit = 50, offset = 0 } = {}) {
  const pool = await getPool();
  const request = pool.request();
  const safeLimit = Math.min(Number(limit) || 50, 200);
  const safeOffset = Math.max(Number(offset) || 0, 0);
  const columns = [...new Set([...idColumns(resource), ...resource.list])].map(quoteIdentifier).join(', ');
  const searchable = resource.list.filter((column) => /name|title|email|code|slug|number|status/i.test(column));
  let where = '';

  if (search && searchable.length > 0) {
    request.input('search', sql.NVarChar(300), `%${search}%`);
    where = `WHERE ${searchable.map((column) => `CONVERT(NVARCHAR(4000), ${quoteIdentifier(column)}) LIKE @search`).join(' OR ')}`;
  }

  request.input('limit', sql.Int, safeLimit);
  request.input('offset', sql.Int, safeOffset);

  const orderColumn = resource.list.includes('CreatedAtUtc') ? 'CreatedAtUtc' : idColumns(resource)[0];
  const result = await request.query(`
    SELECT ${columns}
    FROM ${tableName(resource)}
    ${where}
    ORDER BY ${quoteIdentifier(orderColumn)} DESC
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
  `);

  return result.recordset;
}

export async function getResourceById(resource, idValues) {
  const pool = await getPool();
  const request = pool.request();
  const where = addIdWhere(request, resource, idValues);
  const result = await request.query(`SELECT * FROM ${tableName(resource)} WHERE ${where};`);
  return result.recordset[0] ?? null;
}

export async function createResource(resource, body) {
  const payload = writablePayload(resource, body);
  const columns = Object.keys(payload);
  if (columns.length === 0) return null;

  const pool = await getPool();
  const request = pool.request();
  columns.forEach((column, index) => bindValue(request, `value${index}`, payload[column]));

  const result = await request.query(`
    INSERT INTO ${tableName(resource)} (${columns.map(quoteIdentifier).join(', ')})
    OUTPUT inserted.*
    VALUES (${columns.map((_, index) => `@value${index}`).join(', ')});
  `);

  return result.recordset[0] ?? null;
}

export async function updateResource(resource, idValues, body) {
  const payload = writablePayload(resource, body);
  const columns = Object.keys(payload).filter((column) => !idColumns(resource).includes(column));
  if (columns.length === 0) return getResourceById(resource, idValues);

  const pool = await getPool();
  const request = pool.request();
  columns.forEach((column, index) => bindValue(request, `value${index}`, payload[column]));
  const where = addIdWhere(request, resource, idValues);

  const result = await request.query(`
    UPDATE ${tableName(resource)}
    SET ${columns.map((column, index) => `${quoteIdentifier(column)} = @value${index}`).join(', ')}
    OUTPUT inserted.*
    WHERE ${where};
  `);

  return result.recordset[0] ?? null;
}

export async function deleteResource(resource, idValues) {
  const pool = await getPool();
  const request = pool.request();
  const where = addIdWhere(request, resource, idValues);
  const result = await request.query(`DELETE FROM ${tableName(resource)} WHERE ${where};`);
  return result.rowsAffected[0] > 0;
}
