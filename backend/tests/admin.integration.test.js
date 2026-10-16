import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

test('admin operations work against the installed SQL schema', { skip: process.env.RUN_ADMIN_DB_TESTS !== '1', timeout: 90000 }, async (t) => {
  const { default: request } = await import('supertest');
  const { default: app } = await import('../src/app.js');
  const { getPool, sql } = await import('../src/config/database.js');
  const { createAccessToken } = await import('../src/modules/auth/auth.token.service.js');
  const pool = await getPool();
  const id = randomUUID();
  const productId = randomUUID();
  const tag = `admin-test-${randomUUID()}`;
  const token = createAccessToken({ id, roles: ['ADMIN'] }, randomUUID());
  const customer = createAccessToken({ id, roles: ['CUSTOMER'] }, randomUUID());
  const target = process.env.ADMIN_TEST_BASE_URL || app;
  let zone, method, rate;
  async function api(verb, path, body, status = 200, access = token) {
    const response = await request(target)[verb](`/api/v1${path}`).set('Authorization', `Bearer ${access}`).send(body);
    assert.equal(response.status, status, `${verb} ${path}: ${JSON.stringify(response.body)}`);
    return response.body.data;
  }
  try {
    await pool.request().input('id', sql.UniqueIdentifier, id).input('product', sql.UniqueIdentifier, productId).input('tag', sql.NVarChar(100), tag).query(`
      INSERT dbo.Users (UserId, FirstName, Email, PasswordHash) VALUES (@id, 'Admin test', @tag + '@example.invalid', 'No login');
      INSERT dbo.Categories (CategoryName, Slug) VALUES (@tag, @tag);
      DECLARE @category int = SCOPE_IDENTITY();
      INSERT dbo.Products (ProductId, CategoryId, ProductName, Slug, ProductStatus) VALUES (@product, @category, @tag, @tag, 'Draft');
    `);
    await t.test('valid credentials keep working after repeated successful sign-ins', async () => {
      const { default: bcrypt } = await import('bcrypt');
      const password = `Fixture-only-${randomUUID()}!`;
      await pool.request().input('id', sql.UniqueIdentifier, id).input('hash', sql.NVarChar(255), await bcrypt.hash(password, 10))
        .query("UPDATE dbo.Users SET PasswordHash=@hash, AccountStatus='Active', EmailVerifiedAtUtc=SYSUTCDATETIME() WHERE UserId=@id");
      for (let count = 0; count < 12; count++) {
        const result = await api('post', '/auth/login', { email: `${tag}@example.invalid`, password });
        assert.equal(result.user.id.toLowerCase(), id.toLowerCase());
      }
    });
    await t.test('inventory and shipment lists validate filters and protect admin access', async () => {
      await api('get', '/inventory');
      await api('get', '/inventory/summary');
      const shipments = (await api('get', '/shipping/shipments?status=CREATED&limit=1')).shipments;
      assert.ok(Array.isArray(shipments.items));
      assert.equal(shipments.pagination.limit, 1);
      await api('get', '/shipping/shipments?status=INVALID', undefined, 400);
      await api('get', '/shipping/shipments', undefined, 403, customer);
    });
    await t.test('catalog editing and inventory reorder settings persist', async () => {
      const fragrance = await api('post', '/admin/resources/fragrances', { FragranceName: tag, Slug: tag, Description: 'Test fragrance', ScentFamily: 'Woody', IsActive: true }, 201);
      const edited = await api('put', `/admin/resources/fragrances/${fragrance.FragranceId}`, { Description: 'Updated fragrance', IsActive: false });
      assert.equal(edited.Description, 'Updated fragrance');
      assert.equal(Boolean(edited.IsActive), false);
      const changes = (await api('get', '/admin/audit-logs?search=Fragrances&range=today')).auditLogs;
      assert.ok(changes.items.some((entry) => entry.ActionName === 'RECORD_UPDATE' && entry.ActorUserId.toLowerCase() === id.toLowerCase()));
      const brand = await api('post', '/admin/resources/brands', { BrandName: tag, Slug: tag, IsActive: true }, 201);
      assert.equal((await api('put', `/admin/resources/brands/${brand.BrandId}`, { BrandName: `${tag} edited` })).BrandName, `${tag} edited`);
      const category = (await api('get', `/admin/resources/categories?search=${tag}`))[0];
      assert.equal((await api('put', `/admin/resources/categories/${category.CategoryId}`, { Description: 'Edited category' })).Description, 'Edited category');
      assert.equal((await api('put', `/admin/resources/products/${productId}`, { ShortDescription: 'Edited product' })).ShortDescription, 'Edited product');
      const variant = await api('post', '/admin/resources/product-variants', { ProductId: productId, SKU: tag, VariantName: 'Default', SellingPrice: 323, IsActive: true }, 201);
      await api('post', '/admin/resources/inventory', { ProductVariantId: variant.ProductVariantId, OnHandQuantity: 10, ReorderLevel: 2 }, 201);
      const updated = (await api('patch', `/inventory/${variant.ProductVariantId}/reorder`, { reorderLevel: 3, reorderQuantity: 8 })).item;
      assert.equal(updated.ReorderLevel, 3);
      assert.equal(updated.ReorderQuantity, 8);
    });
    await t.test('shipping zones, methods and rates can be created, edited and deactivated', async () => {
      zone = (await api('post', '/admin/resources/shipping-zones', { ZoneName: tag, CountryCode: 'IN', IsActive: true }, 201)).ShippingZoneId;
      method = (await api('post', '/admin/resources/shipping-methods', { MethodCode: tag.slice(-36), MethodName: tag, EstimatedMinDays: 2, EstimatedMaxDays: 5, IsActive: true }, 201)).ShippingMethodId;
      rate = (await api('post', '/admin/resources/shipping-rates', { ShippingZoneId: zone, ShippingMethodId: method, MinWeightGrams: 0, BaseFee: 99, AdditionalPerKgFee: 10, IsActive: true }, 201)).ShippingRateId;
      assert.equal((await api('get', `/admin/resources/shipping-rates/${rate}`)).BaseFee, 99);
      const updated = await api('put', `/admin/resources/shipping-rates/${rate}`, { BaseFee: 75, IsActive: false });
      assert.equal(Number(updated.BaseFee), 75);
      assert.equal(Boolean(updated.IsActive), false);
    });
    await t.test('typed private settings save and appear in searchable audit history', async () => {
      const setting = (await api('put', `/admin/settings/${tag}`, { settingValue: 12.5, valueType: 'number', isPublic: false })).setting;
      assert.equal(setting.ValueType, 'number');
      assert.equal(setting.SettingValue, '12.5');
      assert.equal(Boolean(setting.IsPublic), false);
      const history = (await api('get', `/admin/audit-logs?search=${tag}%40example.invalid&status=SUCCESS&range=today`)).auditLogs;
      assert.ok(history.items.length > 0);
      assert.ok(history.items.every((item) => item.Email === `${tag}@example.invalid` && item.Outcome === 'SUCCESS'));
      assert.equal((await api('get', `/admin/audit-logs/${history.items[0].AuditLogId}`)).auditLog.ActionName, 'SETTING_UPSERT');
      assert.equal((await api('get', `/admin/audit-logs?search=${tag}%40example.invalid&status=DENIED&range=today`)).auditLogs.items.length, 0);
    });
    await t.test('content supports create, edit, search, status filters and archive', async () => {
      const banner = (await api('post', '/admin/content/banners', { title: tag, status: 'DRAFT' }, 201)).banner;
      await api('patch', `/admin/content/banners/${banner.id}`, { title: `${tag} updated`, status: 'PUBLISHED' });
      const banners = (await api('get', `/admin/content/banners?search=${tag}&status=PUBLISHED&limit=1`)).banners;
      assert.equal(banners.items[0].title, `${tag} updated`);
      assert.equal(banners.pagination.total, 1);
      await api('delete', `/admin/content/banners/${banner.id}`, undefined, 204);
      assert.equal((await api('get', `/admin/content/banners?search=${tag}&status=ARCHIVED`)).banners.items.length, 1);
      const promo = (await api('post', '/admin/content/promotions', { title: tag, layoutType: 'TEXT_ONLY', status: 'DRAFT' }, 201)).promotion;
      await api('patch', `/admin/content/promotions/${promo.id}`, { description: 'Edited promotion' });
      assert.equal((await api('get', `/admin/content/promotions?search=${tag}`)).promotions.items[0].description, 'Edited promotion');
      const seo = (await api('post', '/admin/content/seo', { entityType: 'PATH', path: `/${tag}`, metaTitle: tag, metaDescription: 'Test description' }, 201)).seo;
      await api('patch', `/admin/content/seo/${seo.id}`, { metaDescription: 'Edited description' });
      assert.equal((await api('get', `/admin/content/seo?search=${tag}`)).seo.items[0].metaDescription, 'Edited description');
      assert.equal((await api('get', `/admin/content/seo?search=missing-${tag}`)).seo.items.length, 0);
      await api('post', '/admin/content/featured-products', { productId, sectionKey: tag, displayOrder: 1, status: 'DRAFT' }, 201);
      const featured = (await api('get', `/admin/content/featured-products?search=${tag}&status=DRAFT`)).featuredProducts;
      assert.equal(featured.items.length, 1);
      await api('patch', `/admin/content/featured-products/${featured.items[0].id}`, { displayOrder: 2, status: 'PUBLISHED' });
      assert.equal((await api('get', `/admin/content/featured-products?search=${tag}&status=DRAFT`)).featuredProducts.items.length, 0);
      assert.equal((await api('get', `/admin/content/featured-products?search=${tag}&status=PUBLISHED`)).featuredProducts.items[0].displayOrder, 2);
    });
    await t.test('reports export CSV through authenticated requests and reject invalid dates', async () => {
      for (const type of ['sales','revenue','orders','products','inventory','refunds']) {
        const response = await request(target).get(`/api/v1/admin/reports/${type}?range=last7&format=csv`).set('Authorization', `Bearer ${token}`);
        assert.equal(response.status, 200);
        assert.match(response.headers['content-type'], /text\/csv/);
        assert.match(response.headers['content-disposition'], /attachment/);
      }
      await api('get', '/admin/reports/sales?range=custom', undefined, 400);
      await api('get', '/admin/reports/sales', undefined, 403, customer);
    });
    await t.test('messages, ticket status, internal notes and customer notifications persist', async () => {
        await api('get', '/admin/contact-messages/summary', undefined, 403, customer);
        const beforeMessages = (await api('get', '/admin/contact-messages/summary')).summary;
      const message = (await api('post', '/contact', { name: 'Test customer', email: `${tag}@example.invalid`, subject: tag, message: 'An isolated admin contact message.' }, 201, customer)).message;
        const checkMessageTotals = async (currentKey) => {
          const summary = (await api('get', '/admin/contact-messages/summary')).summary;
          assert.equal(summary.total, beforeMessages.total + 1);
          for (const key of ['newMessages', 'inProgress', 'resolved', 'closed']) {
            assert.equal(summary[key], beforeMessages[key] + (key === currentKey ? 1 : 0));
          }
          assert.equal(summary.total, summary.newMessages + summary.inProgress + summary.resolved + summary.closed);
        };
        await checkMessageTotals('newMessages');
        for (const [status, key] of [['IN_PROGRESS', 'inProgress'], ['CLOSED', 'closed'], ['RESOLVED', 'resolved']]) {
          await api('patch', `/admin/contact-messages/${message.ContactMessageId}`, { status });
          await checkMessageTotals(key);
        }
      assert.equal((await api('get', `/admin/contact-messages/${message.ContactMessageId}`)).message.MessageStatus, 'RESOLVED');
       const inbox = (await api('get', `/admin/contact-messages?search=${encodeURIComponent(tag)}&status=RESOLVED&sort=oldest&limit=1`)).messages;
       assert.ok(inbox.items.some((item) => item.ContactMessageId === message.ContactMessageId));
       assert.equal(inbox.pagination.total, 1);
       const emptyPage = (await api('get', `/admin/contact-messages?search=${encodeURIComponent(tag)}&status=RESOLVED&page=2&limit=1`)).messages;
       assert.equal(emptyPage.items.length, 0);
       assert.equal(emptyPage.pagination.total, 1);
       assert.equal((await api('get', `/admin/contact-messages?search=${encodeURIComponent(tag)}&status=NEW`)).messages.items.length, 0);
       assert.equal((await api('get', '/admin/contact-messages?search=%25')).messages.items.some((item) => item.ContactMessageId === message.ContactMessageId), false);
      const ticket = (await api('post', '/support/tickets', { subject: tag, message: 'An isolated admin support question.' }, 201, customer)).ticket;
      await api('patch', `/admin/support/tickets/${ticket.SupportTicketId}`, { status: 'IN_PROGRESS', priority: 'HIGH' });
      await api('post', `/admin/support/tickets/${ticket.SupportTicketId}/messages`, { message: 'Staff-only test note', isInternalNote: true }, 201);
      const adminView = (await api('get', `/admin/support/tickets/${ticket.SupportTicketId}`)).ticket;
      assert.equal(adminView.ticket.TicketStatus, 'IN_PROGRESS');
      assert.ok(adminView.messages.some((entry) => entry.IsInternalNote));
      const customerView = (await api('get', `/support/tickets/${ticket.SupportTicketId}`, undefined, 200, customer)).ticket;
      assert.ok(customerView.messages.every((entry) => !entry.IsInternalNote));
      await api('post', '/admin/notifications', { userId: id, title: tag, message: 'Test notification for isolated fixture only.' }, 201);
      const notifications = (await api('get', '/notifications', undefined, 200, customer)).notifications;
      assert.ok(notifications.items.some((entry) => entry.Title === tag));
    });
  } finally {
    await pool.request().input('id', sql.UniqueIdentifier, id).input('product', sql.UniqueIdentifier, productId).input('tag', sql.NVarChar(100), tag)
      .input('zone', sql.Int, zone ?? null).input('method', sql.Int, method ?? null).input('rate', sql.Int, rate ?? null).query(`
      SET XACT_ABORT ON; BEGIN TRANSACTION;
      DELETE dbo.ShippingRates WHERE ShippingRateId=@rate;
      DELETE dbo.ShippingZones WHERE ShippingZoneId=@zone;
      DELETE dbo.ShippingMethods WHERE ShippingMethodId=@method;
      DELETE dbo.AuditLogs WHERE ActorUserId=@id;
      DELETE dbo.StoreSettings WHERE SettingKey=@tag;
      DELETE dbo.HomepageBanners WHERE CreatedByUserId=@id;
      DELETE dbo.PromotionalSections WHERE CreatedByUserId=@id;
      DELETE dbo.SeoMetadata WHERE CreatedByUserId=@id;
      DELETE dbo.FeaturedProducts WHERE CreatedByUserId=@id;
      DELETE dbo.Notifications WHERE UserId=@id;
      DELETE dbo.RefreshTokens WHERE UserId=@id;
      DELETE dbo.ContactMessages WHERE Email=@tag+'@example.invalid';
      DELETE m FROM dbo.SupportTicketMessages m JOIN dbo.SupportTickets t ON t.SupportTicketId=m.SupportTicketId WHERE t.UserId=@id;
      DELETE dbo.SupportTickets WHERE UserId=@id;
      DELETE i FROM dbo.Inventory i JOIN dbo.ProductVariants v ON v.ProductVariantId=i.ProductVariantId WHERE v.ProductId=@product;
      DELETE dbo.ProductVariants WHERE ProductId=@product;
      DELETE dbo.Products WHERE ProductId=@product;
      DELETE dbo.Categories WHERE Slug=@tag;
      DELETE dbo.Brands WHERE Slug=@tag;
      DELETE dbo.Fragrances WHERE Slug=@tag;
      DELETE dbo.Users WHERE UserId=@id;
      COMMIT;
    `);
    await pool.close();
  }
});
