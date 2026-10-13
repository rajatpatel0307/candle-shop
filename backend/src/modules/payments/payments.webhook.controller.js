import { AppError } from '../../common/errors/AppError.js';
import { processWebhook } from './payments.webhook.service.js';
import { webhookProviderSchema } from './payments.validation.js';
import { validate } from '../carts/carts.utils.js';

export async function handleWebhook(req, res) {
  const { provider } = validate(webhookProviderSchema, req.params);
  if (provider !== 'RAZORPAY') throw new AppError(404, 'PAYMENT_PROVIDER_NOT_FOUND', 'Payment provider webhook is not supported.');
  const signature = req.headers['x-razorpay-signature'];
  const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body || {}));
  const payload = req.body;
  const result = await processWebhook({ rawBody, signature, payload });
  res.json({ ok: true, duplicate: result.duplicate });
}
