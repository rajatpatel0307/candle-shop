import { Router } from 'express';
import { z } from 'zod';
import { AppError } from '../../common/errors/AppError.js';
import { databaseUnavailableError, isDatabaseConnectionError, isDatabaseSchemaError } from '../../common/errors/databaseErrors.js';
import { asyncHandler } from '../../common/middleware/asyncHandler.js';
import { createContactMessage, getHomeData, getProduct, listCategories, listProducts } from './storefront.repository.js';
import { fallbackCategories, fallbackHomeData, fallbackProduct, fallbackProducts } from './fallbackData.js';

const router = Router();

const contactSchema = z.object({
  name: z.string().min(2).max(200),
  email: z.string().email().max(320),
  subject: z.string().max(200).optional(),
  message: z.string().min(10).max(4000),
});

router.get('/home', asyncHandler(async (req, res) => {
  try {
    res.json({ data: await getHomeData() });
  } catch (error) {
    if (!isDatabaseConnectionError(error) && !isDatabaseSchemaError(error)) throw error;
    console.warn(`[warn] Storefront fallback active: ${error.message}`);
    res.setHeader('X-Data-Source', 'fallback');
    res.json({ data: fallbackHomeData() });
  }
}));

router.get('/products', asyncHandler(async (req, res) => {
  try {
    res.json({ data: await listProducts(req.query) });
  } catch (error) {
    if (!isDatabaseConnectionError(error) && !isDatabaseSchemaError(error)) throw error;
    console.warn(`[warn] Product fallback active: ${error.message}`);
    res.setHeader('X-Data-Source', 'fallback');
    res.json({ data: fallbackProducts });
  }
}));

router.get('/products/:slug', asyncHandler(async (req, res) => {
  let product;
  try {
    product = await getProduct(req.params.slug);
  } catch (error) {
    if (!isDatabaseConnectionError(error) && !isDatabaseSchemaError(error)) throw error;
    console.warn(`[warn] Product detail fallback active: ${error.message}`);
    res.setHeader('X-Data-Source', 'fallback');
    product = fallbackProduct(req.params.slug);
  }
  if (!product) throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product was not found.');
  res.json({ data: product });
}));

router.get('/categories', asyncHandler(async (req, res) => {
  try {
    res.json({ data: await listCategories() });
  } catch (error) {
    if (!isDatabaseConnectionError(error) && !isDatabaseSchemaError(error)) throw error;
    console.warn(`[warn] Category fallback active: ${error.message}`);
    res.setHeader('X-Data-Source', 'fallback');
    res.json({ data: fallbackCategories });
  }
}));

router.post('/contact', asyncHandler(async (req, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(400, 'INVALID_CONTACT_MESSAGE', 'Contact message is invalid.', parsed.error.flatten());
  try {
    res.status(201).json({ data: await createContactMessage(parsed.data) });
  } catch (error) {
    if (isDatabaseSchemaError(error)) throw databaseUnavailableError(error);
    if (!isDatabaseConnectionError(error)) throw error;
    throw databaseUnavailableError(error);
  }
}));

export default router;
