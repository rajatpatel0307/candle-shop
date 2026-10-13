import { AppError } from '../../common/errors/AppError.js';
import * as repo from './admin.repository.js';

export async function list(query) {
  const result = await repo.listAuditLogs(query);
  return { items: result.rows, pagination: { page: query.page, limit: query.limit, total: result.total } };
}

export async function get(id) {
  const log = await repo.getAuditLog(id);
  if (!log) throw new AppError(404, 'AUDIT_LOG_NOT_FOUND', 'Audit log was not found.');
  return log;
}

export async function record(input) {
  return repo.insertAuditLog(input);
}
