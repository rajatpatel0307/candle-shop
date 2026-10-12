import { Router } from 'express';
import { getPool } from '../../config/database.js';
import { databaseUnavailableError, isDatabaseConnectionError } from '../../common/errors/databaseErrors.js';
import { asyncHandler } from '../../common/middleware/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  // Health endpoint checks app status. DB connectivity can be added to a separate readiness probe.
  res.json({ status: 'ok', service: 'candle-ecommerce-api' });
}));

router.get('/ready', asyncHandler(async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request().query('SELECT 1 AS ready');
    res.json({ status: 'ready', database: 'connected' });
  } catch (error) {
    if (!isDatabaseConnectionError(error)) throw error;
    throw databaseUnavailableError(error);
  }
}));

export default router;
