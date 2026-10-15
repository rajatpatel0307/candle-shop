import { Router } from 'express';
import { authenticate } from '../auth/auth.middleware.js';
import { asyncHandler } from '../../common/middleware/asyncHandler.js';
import { me } from '../auth/auth.service.js';
import { listUserAddresses } from '../checkout/checkout.repository.js';
import { ok, validate } from '../carts/carts.utils.js';
import { addressIdSchema, addressSchema, profileSchema } from './account.validation.js';
import { deleteAddress, saveAddress, updateProfile } from './account.repository.js';

const router = Router();
router.use(authenticate);
router.get('/profile', asyncHandler(async (req, res) => ok(res, 'Profile loaded.', { user: await me(req.user.id) })));
router.put('/profile', asyncHandler(async (req, res) => {
  await updateProfile(req.user.id, validate(profileSchema, req.body));
  ok(res, 'Profile saved.', { user: await me(req.user.id) });
}));
router.get('/addresses', asyncHandler(async (req, res) => ok(res, 'Addresses loaded.', { addresses: await listUserAddresses(req.user.id) })));
router.post('/addresses', asyncHandler(async (req, res) => ok(res.status(201), 'Address saved.', { address: await saveAddress(req.user.id, validate(addressSchema, req.body)) })));
router.put('/addresses/:id', asyncHandler(async (req, res) => {
  const { id } = validate(addressIdSchema, req.params);
  ok(res, 'Address updated.', { address: await saveAddress(req.user.id, validate(addressSchema, req.body), id) });
}));
router.delete('/addresses/:id', asyncHandler(async (req, res) => {
  const { id } = validate(addressIdSchema, req.params);
  await deleteAddress(req.user.id, id);
  ok(res, 'Address removed.');
}));
export default router;
