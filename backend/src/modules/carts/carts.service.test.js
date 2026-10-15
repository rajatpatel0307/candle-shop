import test, { after, beforeEach, mock } from 'node:test';
import assert from 'node:assert/strict';

// Exercise the service and SQL repository without connecting to a real database.
process.env.DB_DRIVER = 'tedious';
process.env.DB_SERVER = 'localhost';
process.env.DB_NAME = 'cart_tests';
process.env.DB_USER = 'test';
process.env.DB_PASSWORD = 'test';
const { sql } = await import('../../config/database.js');
let item;
let writes;
const pool = {
  request() {
    const inputs = {};
    return {
      input(name, _type, value) { inputs[name] = value; return this; },
      async query(query) {
        if (query.includes('UPDATE ci')) {
          writes += 1;
          item.Quantity = inputs.quantity;
          return { rowsAffected: [1] };
        }
        if (query.includes('FROM dbo.CartItems ci')) return { recordset: [item] };
        if (query.includes('FROM dbo.CartItems')) return { recordset: [item] };
        if (query.includes('FROM dbo.ProductVariants')) return { recordset: [item] };
        if (query.includes('FROM dbo.Carts')) return { recordset: [{ CartId: 'test-cart' }] };
        throw new Error(`Unexpected query: ${query}`);
      },
    };
  },
};
mock.method(sql.ConnectionPool.prototype, 'connect', async () => pool);
const { addItem, updateItem } = await import('./carts.service.js');
after(() => mock.restoreAll());

beforeEach(() => {
  writes = 0;
  item = {
    CartItemId: '42', ProductVariantId: 'test-variant', Quantity: 1,
    ProductStatus: 'Active', IsActive: true, AvailableQuantity: 5, SellingPrice: 323,
  };
});

test('quantity update accepts SQL bigint string IDs and recalculates totals', async () => {
  const cart = await updateItem('user', 42, { quantity: 2 });
  assert.equal(writes, 1);
  assert.equal(cart.items[0].Quantity, 2);
  assert.equal(cart.summary.totalQuantity, 2);
  assert.equal(cart.summary.subtotal, 646);
});

test('quantity can increase up to the available stock', async () => {
  const cart = await updateItem('user', 42, { quantity: 5 });
  assert.equal(cart.items[0].Quantity, 5);
  assert.equal(cart.summary.isValid, true);
});

test('quantity update rejects stock overflow without writing', async () => {
  await assert.rejects(updateItem('user', 42, { quantity: 6 }), { code: 'INSUFFICIENT_STOCK' });
  assert.equal(writes, 0);
});

test('quantity update rejects an item outside the active cart', async () => {
  await assert.rejects(updateItem('user', 43, { quantity: 2 }), { code: 'CART_ITEM_NOT_FOUND' });
  assert.equal(writes, 0);
});

test('adding more includes units already in the cart when checking stock', async () => {
  item.Quantity = 5;
  await assert.rejects(addItem('user', { productVariantId: 'test-variant', quantity: 1 }), { code: 'INSUFFICIENT_STOCK' });
  assert.equal(writes, 0);
});
