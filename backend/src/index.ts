import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import routes from './routes';
import { errorMiddleware } from './middleware/error.middleware';
import logger from './utils/logger';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: [config.frontendUrl, /\.vercel\.app$/],
    credentials: true,
  })
);
app.use(express.json({ limit: '10kb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.isDev ? 1000 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: 'Too many authentication attempts' },
});

app.use(limiter);
app.use('/api/auth', authLimiter);
app.use('/api', routes);
app.use(errorMiddleware);

app.listen(config.port, () => {
  logger.info(`TRON Miner API running on port ${config.port}`, {
    env: config.nodeEnv,
  });
});

export default app;
