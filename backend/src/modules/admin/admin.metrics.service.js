import * as repo from './admin.repository.js';

export async function managementOverview() {
  const [products, categories, customers, orders, inventory] = await Promise.all([
    repo.simpleCount('Products'),
    repo.simpleCount('Categories'),
    repo.simpleCount('Users'),
    repo.simpleCount('Orders'),
    repo.inventoryOverview(),
  ]);
  return { products, categories, customers, orders, inventory };
}
