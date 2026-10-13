import * as repo from './admin.repository.js';

export async function summary(query) {
  return repo.summary(query);
}

export async function sales(query) {
  return repo.timeSeries(query, 'orders');
}

export async function revenue(query) {
  return repo.timeSeries(query, 'revenue');
}

export async function orders(query) {
  return repo.orderStatus(query);
}

export async function topProducts(query) {
  return repo.topProducts(query);
}

export async function lowStock() {
  return repo.lowStock(10);
}

export async function recentOrders() {
  return repo.recentOrders(10);
}

export async function recentActivity() {
  return repo.recentActivity(20);
}
