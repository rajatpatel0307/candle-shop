import { AppError } from '../../common/errors/AppError.js';
import * as repo from './carts.repository.js';

export async function getSellableVariant({ productId, productVariantId }) {
  const variant = await repo.findSellableVariant({ productId, productVariantId });
  if (!variant) {
    throw new AppError(404, 'PRODUCT_UNAVAILABLE', 'Product or variant is unavailable.');
  }
  return variant;
}
