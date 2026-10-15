import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';
import { generalApiLimiter } from './rateLimiter.js';
import { loginRateLimit } from '../../modules/auth/auth.rateLimit.js';

test('browsing quota cannot block login and successful sign-ins do not consume failed-attempt quota', async () => {
  const app = express();
  app.use('/api/v1', generalApiLimiter);
  app.get('/api/v1/catalog', (req, res) => res.sendStatus(200));
  app.post('/api/v1/auth/login', loginRateLimit, (req, res) => res.sendStatus(req.query.fail ? 401 : 200));
  const server = app.listen(0);
  const agent = request(server);
  try {
    const initial = await agent.get('/api/v1/catalog');
    assert.equal(initial.status, 200);
    const limit = Number(/limit=(\d+)/.exec(initial.headers.ratelimit)[1]);
    for (let count = 1; count < limit; count++) assert.equal((await agent.get('/api/v1/catalog')).status, 200);
    assert.equal((await agent.get('/api/v1/catalog')).status, 429);
    for (let count = 0; count < 12; count++) assert.equal((await agent.post('/api/v1/auth/login')).status, 200);
    for (let count = 0; count < 10; count++) assert.equal((await agent.post('/api/v1/auth/login?fail=1')).status, 401);
    const blocked = await agent.post('/api/v1/auth/login');
    assert.equal(blocked.status, 429);
    assert.equal(blocked.body.error.code, 'LOGIN_RATE_LIMITED');
    assert.ok(Number(blocked.headers['retry-after']) > 0);
  } finally { await new Promise((resolve) => server.close(resolve)); }
});
