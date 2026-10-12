import { AppError } from '../../common/errors/AppError.js';
import * as cartService from '../carts/carts.service.js';
import * as repo from './wishlists.repository.js';

export async function getWishlist(userId) {
  const wishlist = await repo.getOrCreateDefaultWishlist(userId);
  const items = await repo.listWishlistItems(wishlist.WishlistId);
  return { wishlist, items, summary: { totalItems: items.length } };
}

export async function getWishlistItems(userId, wishlistId) {
  const wishlist = await repo.getOrCreateDefaultWishlist(userId);
  if (wishlist.WishlistId !== wishlistId) throw new AppError(404, 'WISHLIST_NOT_FOUND', 'Wishlist was not found.');
  return { wishlist, items: await repo.listWishlistItems(wishlistId) };
}

export async function addItem(userId, input) {
  const product = await repo.findProductForWishlist(input);
  if (!product) throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product was not found.');
  if (input.productVariantId && !product.ProductVariantId) throw new AppError(400, 'INVALID_VARIANT', 'Variant does not belong to this product.');
  const wishlist = await repo.getOrCreateDefaultWishlist(userId);
  await repo.addWishlistItem({
    wishlistId: wishlist.WishlistId,
    productId: input.productId,
    productVariantId: input.productVariantId || product.ProductVariantId || null,
  });
  return getWishlist(userId);
}

export async function removeItem(userId, itemId) {
  const removed = await repo.removeWishlistItem({ userId, itemId });
  if (!removed) throw new AppError(404, 'WISHLIST_ITEM_NOT_FOUND', 'Wishlist item was not found.');
  return getWishlist(userId);
}

export async function removeByProduct(userId, productId) {
  await repo.removeByProduct({ userId, productId });
  return getWishlist(userId);
}

export async function moveToCart(userId, itemId) {
  const item = await repo.getWishlistItemForUser(userId, itemId);
  if (!item) throw new AppError(404, 'WISHLIST_ITEM_NOT_FOUND', 'Wishlist item was not found.');
  const cart = await cartService.addItem(userId, {
    productId: item.ProductId,
    productVariantId: item.ProductVariantId,
    quantity: 1,
  });
  await repo.removeWishlistItem({ userId, itemId });
  return { cart, wishlist: await getWishlist(userId) };
}
