import { AppError } from '../../common/errors/AppError.js';
import * as audit from './admin.audit.service.js';
import * as repo from './admin.repository.js';

export async function list() {
  return repo.listSettings();
}

export async function get(key) {
  const setting = await repo.getSetting(key);
  if (!setting) throw new AppError(404, 'SETTING_NOT_FOUND', 'Store setting was not found.');
  return setting;
}

export async function upsert(input, userId, req) {
  const key = input.settingKey;
  if (/secret|password|token|key/i.test(key)) {
    throw new AppError(400, 'SENSITIVE_SETTING_REJECTED', 'Secrets must not be stored as editable store settings.');
  }
  const setting = await repo.upsertSetting(input, userId);
  await audit.record({ userId, action: 'SETTING_UPSERT', entityName: 'StoreSettings', entityId: setting.StoreSettingId, details: { key }, req });
  return setting;
}

export async function bulkUpsert(input, userId, req) {
  const settings = [];
  for (const setting of input.settings) settings.push(await upsert(setting, userId, req));
  return settings;
}
