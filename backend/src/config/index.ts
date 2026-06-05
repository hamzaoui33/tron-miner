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

export interface AppConfig {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  telegramBotToken: string;
  frontendUrl: string;
  adminTelegramIds: string[];
  isDev: boolean;
}

let cachedConfig: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (cachedConfig) return cachedConfig;

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    throw new Error(`Invalid environment variables: ${JSON.stringify(errors)}`);
  }

  cachedConfig = {
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

  return cachedConfig;
}

/** @deprecated Use getConfig() — kept for gradual migration */
export const config = new Proxy({} as AppConfig, {
  get(_target, prop: keyof AppConfig) {
    return getConfig()[prop];
  },
});
