import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('7d'),
  TELEGRAM_BOT_TOKEN: z.string(),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  ADMIN_TELEGRAM_IDS: z.string().default(''),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = {
  port: parseInt(parsed.data.PORT, 10),
  nodeEnv: parsed.data.NODE_ENV,
  databaseUrl: parsed.data.DATABASE_URL,
  jwtSecret: parsed.data.JWT_SECRET,
  jwtExpiresIn: parsed.data.JWT_EXPIRES_IN,
  telegramBotToken: parsed.data.TELEGRAM_BOT_TOKEN,
  frontendUrl: parsed.data.FRONTEND_URL,
  adminTelegramIds: parsed.data.ADMIN_TELEGRAM_IDS.split(',').filter(Boolean),
  isDev: parsed.data.NODE_ENV === 'development',
};
