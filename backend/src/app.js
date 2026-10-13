import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { randomUUID } from 'node:crypto';
import { frontendOrigins } from './config/env.js';
import { generalApiLimiter } from './common/middleware/rateLimiter.js';
import { notFound } from './common/middleware/notFound.js';
import { errorHandler } from './common/middleware/errorHandler.js';
import routes from './routes/index.js';

const app = express();

app.disable('x-powered-by');
app.use((req, res, next) => {
  req.id = randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
});
app.use(helmet());
app.use(cookieParser());
app.use(cors({
  origin(origin, callback) {
    if (!origin || frontendOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS.'));
  },
  credentials: true,
}));
app.use(express.json({
  limit: '1mb',
  verify: (req, res, buffer) => {
    if (req.originalUrl?.includes('/payments/webhooks/')) {
      req.rawBody = Buffer.from(buffer);
    }
  },
}));
app.use('/api/v1', generalApiLimiter);
app.use('/api/v1', routes);
app.use(notFound);
app.use(errorHandler);

export default app;
