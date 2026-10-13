import * as repo from './admin.repository.js';

export async function sales(query) {
  return repo.salesReport(query);
}

export async function revenue(query) {
  return repo.timeSeries(query, 'revenue');
}

export async function orders(query) {
  return repo.salesReport(query);
}

export async function products(query) {
  return repo.productReport(query);
}

export async function inventory() {
  return repo.lowStock(200);
}

export async function refunds(query) {
  return repo.refundReport(query);
}

export function toCsv(rows) {
  if (!rows?.length) return '';
  const columns = Object.keys(rows[0]);
  const escape = (value) => {
    const text = value === null || value === undefined ? '' : String(value);
    const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  return [columns.join(','), ...rows.map((row) => columns.map((column) => escape(row[column])).join(','))].join('\n');
}
