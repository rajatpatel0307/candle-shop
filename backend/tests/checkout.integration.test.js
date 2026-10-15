import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID, createHmac } from 'node:crypto';

// Opt in: uses isolated fixtures in the configured local database and removes them in finally.
test('checkout works against the installed SQL schema', { skip: process.env.RUN_CHECKOUT_DB_TESTS !== '1', timeout: 90000 }, async (t) => {
  const { default: request } = await import('supertest');
  const { default: app } = await import('../src/app.js');
  const { getPool, sql } = await import('../src/config/database.js');
  const { createAccessToken } = await import('../src/modules/auth/auth.token.service.js');
  const checkoutRepo = await import('../src/modules/checkout/checkout.repository.js');
  const paymentRepo = await import('../src/modules/payments/payments.repository.js');
  const pool = await getPool();
  const userId = randomUUID();
  const productId = randomUUID();
  const variantId = randomUUID();
  const tag = `checkout-test-${randomUUID()}`;
  const token = createAccessToken({ id: userId, roles: ['CUSTOMER'] }, randomUUID());
  const adminToken = createAccessToken({ id: userId, roles: ['ADMIN'] }, randomUUID());
  const apiTarget = process.env.CHECKOUT_TEST_BASE_URL || app;
  const keys = { id: process.env.RAZORPAY_KEY_ID, secret: process.env.RAZORPAY_KEY_SECRET };
  delete process.env.RAZORPAY_KEY_ID;
  delete process.env.RAZORPAY_KEY_SECRET;
  async function api(method, path, body, expected = 200, accessToken = token) {
    // Locally signed provider callbacks stay in-process; the rest can also exercise a running site.
    const target = path.endsWith('/verify') ? app : apiTarget;
    const response = await request(target)[method](`/api/v1${path}`).set('Authorization', `Bearer ${accessToken}`).send(body);
    assert.equal(response.status, expected, `${method} ${path}: ${JSON.stringify(response.body)}`);
    return response.body.data;
  }
  async function stock() {
    const result = await pool.request().input('id', sql.UniqueIdentifier, variantId)
      .query('SELECT OnHandQuantity, ReservedQuantity FROM dbo.Inventory WHERE ProductVariantId = @id');
    return result.recordset[0];
  }
  async function cartRowCount(cartId) {
    const result = await pool.request().input('id', sql.UniqueIdentifier, cartId)
      .query('SELECT COUNT(*) AS ItemCount FROM dbo.CartItems WHERE CartId=@id');
    return result.recordset[0].ItemCount;
  }
  let session;
  let address;
  let order;
  try {
    await pool.request()
      .input('user', sql.UniqueIdentifier, userId).input('product', sql.UniqueIdentifier, productId)
      .input('variant', sql.UniqueIdentifier, variantId).input('tag', sql.NVarChar(100), tag)
      .query(`INSERT INTO dbo.Users (UserId, FirstName, Email, PasswordHash, EmailVerifiedAtUtc)
        VALUES (@user, N'Checkout Test', @tag + N'@example.invalid', N'No login allowed', SYSUTCDATETIME());
        INSERT INTO dbo.Categories (CategoryName, Slug) VALUES (@tag, @tag);
        DECLARE @category int = SCOPE_IDENTITY();
        INSERT INTO dbo.Products (ProductId, CategoryId, ProductName, Slug, ProductStatus)
        VALUES (@product, @category, @tag, @tag, N'Active');
        INSERT INTO dbo.ProductVariants (ProductVariantId, ProductId, SKU, VariantName, SellingPrice)
        VALUES (@variant, @product, @tag, N'Default', 323);
        INSERT INTO dbo.Inventory (ProductVariantId, OnHandQuantity) VALUES (@variant, 20);`);

    await t.test('cart quantity, session creation and address save work', async () => {
      const added = await api('post', '/carts/items', { productVariantId: variantId, quantity: 2 }, 201);
      assert.equal(added.cart.summary.totalQuantity, 2);
      // Match existing carts created by other parts of the app, which use uppercase status values.
      await pool.request().input('id', sql.UniqueIdentifier, added.cart.cartId)
        .query("UPDATE dbo.Carts SET CartStatus=N'ACTIVE' WHERE CartId=@id");
      const key = randomUUID();
      session = (await api('post', '/checkout/session', { idempotencyKey: key }, 201)).checkout;
      assert.equal(session.session.SessionStatus, 'ACTIVE');
      const again = (await api('post', '/checkout/session', { idempotencyKey: key }, 201)).checkout;
      assert.equal(again.session.CheckoutSessionId, session.session.CheckoutSessionId);
      await api('post', '/checkout/addresses', { recipientName: 'Test' }, 400);
      address = (await api('post', '/checkout/addresses', {
        recipientName: 'Checkout Test', phoneNumber: '9876543210', addressLine1: '12 Test Road',
        city: 'Mumbai', stateOrProvince: 'Maharashtra', postalCode: '400001', countryCode: 'IN',
      }, 201)).address;
      session = (await api('put', `/checkout/session/${session.session.CheckoutSessionId}/addresses`, {
        shippingAddressId: address.AddressId, useShippingAsBilling: true,
      })).checkout;
      assert.equal(session.pricing.totalAmount, 745);
      assert.equal((await api('post', `/checkout/session/${session.session.CheckoutSessionId}/validate`)).validation.isValid, true);
    });

    await t.test('unconfigured online payments fail before creating an order', async () => {
      const response = await request(app).post(`/api/v1/checkout/session/${session.session.CheckoutSessionId}/submit`)
        .set('Authorization', `Bearer ${token}`).send({ idempotencyKey: randomUUID(), paymentMethod: 'ONLINE' });
      assert.equal(response.status, 503);
      assert.equal(response.body.error.code, 'PAYMENT_PROVIDER_NOT_CONFIGURED');
      assert.deepEqual(await stock(), { OnHandQuantity: 20, ReservedQuantity: 0 });
    });

    await t.test('COD checkout, duplicate retry, confirmation and order details work', async () => {
      const payload = { idempotencyKey: randomUUID(), paymentMethod: 'COD', confirmPriceChanges: true };
      const path = `/checkout/session/${session.session.CheckoutSessionId}/submit`;
      const confirmed = (await api('post', path, payload, 201)).result;
      order = confirmed.order;
      assert.equal(confirmed.cart.summary.totalQuantity, 0);
      assert.deepEqual(confirmed.cart.items, []);
      assert.equal(await cartRowCount(session.session.CartId), 0);
      assert.equal(order.OrderStatus, 'CONFIRMED');
      assert.equal(order.PaymentMethod, 'COD');
      assert.equal(order.GrandTotal, 745);
      assert.equal((await api('post', path, payload, 201)).result.order.OrderId, order.OrderId);
      assert.equal((await api('post', path, { ...payload, idempotencyKey: randomUUID() }, 201)).result.order.OrderId, order.OrderId);
      assert.deepEqual(await stock(), { OnHandQuantity: 18, ReservedQuantity: 0 });
      assert.equal((await api('get', '/carts')).cart.summary.totalQuantity, 0);
      assert.equal((await api('get', `/payments/orders/${order.OrderId}/status`)).payment.order.PaymentMethod, 'COD');
      await api('get', '/orders');
      await api('get', `/orders/${order.OrderId}`);
    });

    await t.test('admin can find, filter, open and process the confirmed order', async () => {
      await api('get', '/orders/admin', undefined, 403);
      const list = (await api('get', `/orders/admin?search=${encodeURIComponent(order.OrderNumber)}&status=CONFIRMED&paymentStatus=PENDING&page=1&limit=1`, undefined, 200, adminToken)).orders;
      assert.equal(list.pagination.total, 1);
      assert.equal(list.items[0].OrderId, order.OrderId);
      const details = (await api('get', `/orders/admin/${order.OrderId}`, undefined, 200, adminToken)).order;
      assert.equal(details.items[0].Quantity, 2);
      assert.equal(details.addresses.length, 2);
      for (const status of ['PROCESSING', 'READY_TO_SHIP']) {
        const updated = (await api('patch', `/orders/admin/${order.OrderId}/status`, { status, reason: 'Integration test processing' }, 200, adminToken)).order;
        assert.equal(updated.OrderStatus, status);
      }
    });

    await t.test('COD cancellation restores stock exactly once', async () => {
      await api('post', `/orders/${order.OrderId}/cancel`, { reason: 'Integration test cancellation' });
      assert.deepEqual(await stock(), { OnHandQuantity: 20, ReservedQuantity: 0 });
    });

    await t.test('online reservation and signed verification update payment and stock once', async () => {
      await api('post', '/carts/items', { productVariantId: variantId, quantity: 3 }, 201);
      let online = (await api('post', '/checkout/session', { idempotencyKey: randomUUID() }, 201)).checkout;
      online = (await api('put', `/checkout/session/${online.session.CheckoutSessionId}/addresses`, { shippingAddressId: address.AddressId, useShippingAsBilling: true })).checkout;
      // Exercise persistence without contacting a real payment provider or charging money.
      const created = await checkoutRepo.createOrderTransaction({ userId, session: online.session, pricing: online.pricing,
        shippingAddress: online.shippingAddress, billingAddress: online.billingAddress, idempotencyKey: randomUUID(), paymentMethod: 'ONLINE' });
      assert.deepEqual(await stock(), { OnHandQuantity: 20, ReservedQuantity: 3 });
      assert.equal(await cartRowCount(online.session.CartId), 1);
      // A new cart added while payment is pending must survive confirmation of the earlier order.
      await api('post', '/carts/items', { productVariantId: variantId, quantity: 1 }, 201);
      const { payment } = await paymentRepo.createPendingPayment({ order: created.order, idempotencyKey: randomUUID() });
      const providerOrderId = `test_${randomUUID()}`;
      const providerPaymentId = `test_${randomUUID()}`;
      await paymentRepo.attachProviderOrder({ paymentId: payment.PaymentId, providerOrderId });
      process.env.RAZORPAY_KEY_SECRET = 'integration-test-only-secret';
      const payload = { providerOrderId, providerPaymentId,
        providerSignature: createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${providerOrderId}|${providerPaymentId}`).digest('hex') };
      await api('post', `/payments/orders/${created.order.OrderId}/verify`, { ...payload, providerSignature: 'invalid' }, 400);
      assert.equal(await cartRowCount(online.session.CartId), 1);
      await api('post', `/payments/orders/${created.order.OrderId}/verify`, payload);
      await api('post', `/payments/orders/${created.order.OrderId}/verify`, payload);
      assert.deepEqual(await stock(), { OnHandQuantity: 17, ReservedQuantity: 0 });
      const status = (await api('get', `/payments/orders/${created.order.OrderId}/status`)).payment;
      assert.equal(status.order.PaymentStatus, 'SUCCEEDED');
      assert.equal(status.order.OrderStatus, 'CONFIRMED');
      assert.equal(await cartRowCount(online.session.CartId), 0);
      assert.equal((await api('get', '/carts')).cart.summary.totalQuantity, 1);
      await api('delete', '/carts');
    });

    await t.test('stock loss during submission rolls back the order and keeps the cart active', async () => {
      await api('post', '/carts/items', { productVariantId: variantId, quantity: 2 }, 201);
      let checkout = (await api('post', '/checkout/session', {}, 201)).checkout;
      checkout = (await api('put', `/checkout/session/${checkout.session.CheckoutSessionId}/addresses`, { shippingAddressId: address.AddressId, useShippingAsBilling: true })).checkout;
      await pool.request().input('id', sql.UniqueIdentifier, variantId).query('UPDATE dbo.Inventory SET OnHandQuantity=0 WHERE ProductVariantId=@id');
      await assert.rejects(checkoutRepo.createOrderTransaction({ userId, session: checkout.session, pricing: checkout.pricing,
        shippingAddress: checkout.shippingAddress, billingAddress: checkout.billingAddress, idempotencyKey: randomUUID(), paymentMethod: 'COD' }), { code: 'INSUFFICIENT_STOCK' });
      const persisted = await pool.request().input('session', sql.UniqueIdentifier, checkout.session.CheckoutSessionId)
        .query(`SELECT COUNT(*) AS OrdersCreated FROM dbo.Orders WHERE CheckoutSessionId=@session;
          SELECT c.CartStatus FROM dbo.Carts c JOIN dbo.CheckoutSessions s ON s.CartId=c.CartId WHERE s.CheckoutSessionId=@session;`);
      assert.equal(persisted.recordsets[0][0].OrdersCreated, 0);
      assert.equal(persisted.recordsets[1][0].CartStatus, 'Active');
      await pool.request().input('id', sql.UniqueIdentifier, variantId).query('UPDATE dbo.Inventory SET OnHandQuantity=17 WHERE ProductVariantId=@id');
    });

    await t.test('invalid address ownership and expired sessions are rejected', async () => {
      const checkout = (await api('post', '/checkout/session', {}, 201)).checkout;
      await api('put', `/checkout/session/${checkout.session.CheckoutSessionId}/addresses`, { shippingAddressId: randomUUID(), useShippingAsBilling: true }, 404);
      await pool.request().input('id', sql.UniqueIdentifier, checkout.session.CheckoutSessionId)
        .query('UPDATE dbo.CheckoutSessions SET ExpiresAtUtc=DATEADD(minute,-1,SYSUTCDATETIME()) WHERE CheckoutSessionId=@id');
      await api('post', `/checkout/session/${checkout.session.CheckoutSessionId}/submit`, { idempotencyKey: randomUUID(), paymentMethod: 'COD' }, 409);
    });

    await t.test('customer profile and address management persist safely and preserve order snapshots', async () => {
      assert.equal((await api('get', '/account/profile')).user.id.toLowerCase(), userId.toLowerCase());
      const profile = (await api('put', '/account/profile', { firstName: 'Updated Test', lastName: 'Customer', phoneNumber: '9876543210', email: 'cannot-change@example.invalid' })).user;
      assert.equal(profile.firstName, 'Updated Test');
      assert.equal(profile.email, `${tag}@example.invalid`);
      await api('put', '/account/profile', { firstName: 'A', phoneNumber: '123' }, 400);
      const payload = { recipientName: 'Updated Test', phoneNumber: '9876543210', addressLine1: '22 Address Test Road', city: 'Pune', stateOrProvince: 'Maharashtra', postalCode: '411001', addressLabel: 'Work', isDefaultShipping: true, isDefaultBilling: true };
      const saved = (await api('post', '/account/addresses', payload, 201)).address;
      await api('put', `/account/addresses/${saved.AddressId}`, { ...payload, addressLine1: '44 Updated Road' });
      const list = (await api('get', '/account/addresses')).addresses;
      assert.equal(list.filter((item) => item.IsDefaultShipping).length, 1);
      assert.equal(list.filter((item) => item.IsDefaultBilling).length, 1);
      assert.equal(list.find((item) => item.AddressId === saved.AddressId).AddressLine1, '44 Updated Road');
      const otherToken = createAccessToken({ id: randomUUID(), roles: ['CUSTOMER'] }, randomUUID());
      assert.deepEqual((await api('get', '/account/addresses', undefined, 200, otherToken)).addresses, []);
      await api('put', `/account/addresses/${saved.AddressId}`, payload, 404, otherToken);
      await api('delete', `/account/addresses/${saved.AddressId}`, undefined, 404, otherToken);
      await api('get', `/orders/${order.OrderId}`, undefined, 404, otherToken);
      await api('delete', `/account/addresses/${address.AddressId}`);
      const previousOrder = (await api('get', `/orders/${order.OrderId}`)).order;
      assert.equal(previousOrder.addresses[0].AddressLine1, '12 Test Road');
      assert.equal((await api('get', `/checkout/session/${session.session.CheckoutSessionId}`)).checkout.session.ShippingAddressId, null);
      await api('delete', `/account/addresses/${saved.AddressId}`);
      assert.deepEqual((await api('get', '/account/addresses')).addresses, []);
      const search = (await api('get', `/orders?search=${encodeURIComponent(tag)}&page=1&limit=1`)).orders;
      assert.equal(search.items.length, 1);
      assert.ok(search.pagination.total >= 2);
      assert.equal(search.items[0].FirstProductName, tag);
    });
  } finally {
    for (const [name, value] of [['RAZORPAY_KEY_ID', keys.id], ['RAZORPAY_KEY_SECRET', keys.secret]]) {
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    }
    await pool.request().input('user', sql.UniqueIdentifier, userId).input('product', sql.UniqueIdentifier, productId)
      .input('variant', sql.UniqueIdentifier, variantId).input('tag', sql.NVarChar(100), tag)
      .query(`SET XACT_ABORT ON; BEGIN TRANSACTION;
        DELETE FROM dbo.InventoryMovements WHERE ProductVariantId = @variant;
        DELETE FROM dbo.InventoryReservations WHERE ProductVariantId = @variant;
        DELETE a FROM dbo.PaymentAttempts a JOIN dbo.Payments p ON p.PaymentId=a.PaymentId JOIN dbo.Orders o ON o.OrderId=p.OrderId WHERE o.UserId=@user;
        DELETE p FROM dbo.Payments p JOIN dbo.Orders o ON o.OrderId=p.OrderId WHERE o.UserId=@user;
        DELETE h FROM dbo.OrderStatusHistory h JOIN dbo.Orders o ON o.OrderId=h.OrderId WHERE o.UserId=@user;
        DELETE a FROM dbo.OrderAddresses a JOIN dbo.Orders o ON o.OrderId=a.OrderId WHERE o.UserId=@user;
        DELETE FROM dbo.OrderItems WHERE ProductVariantId=@variant;
        UPDATE dbo.CheckoutSessions SET OrderId=NULL WHERE UserId=@user;
        DELETE FROM dbo.Orders WHERE UserId=@user;
        DELETE FROM dbo.CheckoutSessions WHERE UserId=@user;
        DELETE ci FROM dbo.CartItems ci JOIN dbo.Carts c ON c.CartId=ci.CartId WHERE c.UserId=@user;
        DELETE FROM dbo.Carts WHERE UserId=@user;
        DELETE FROM dbo.UserAddresses WHERE UserId=@user;
        DELETE FROM dbo.Inventory WHERE ProductVariantId=@variant;
        DELETE FROM dbo.ProductVariants WHERE ProductVariantId=@variant;
        DELETE FROM dbo.Products WHERE ProductId=@product;
        DELETE FROM dbo.Categories WHERE Slug=@tag;
        DELETE FROM dbo.Users WHERE UserId=@user;
        COMMIT;`);
    await pool.close();
  }
});
