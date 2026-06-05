import crypto from 'crypto';
import { config } from '../config';
import logger from '../utils/logger';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export interface ParsedInitData {
  user: TelegramUser;
  authDate: number;
  hash: string;
  startParam?: string;
}

function parseInitData(initData: string): Record<string, string> {
  const params = new URLSearchParams(initData);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

export function validateTelegramInitData(initData: string): ParsedInitData | null {
  try {
    const params = parseInitData(initData);
    const hash = params.hash;
    if (!hash) return null;

    // Development mode bypass
    if (hash === 'dev_mode' && process.env.NODE_ENV === 'development') {
      const user: TelegramUser = JSON.parse(params.user);
      return {
        user,
        authDate: parseInt(params.auth_date, 10),
        hash,
        startParam: params.start_param,
      };
    }

    const dataCheckArr: string[] = [];
    Object.keys(params)
      .filter((key) => key !== 'hash')
      .sort()
      .forEach((key) => {
        dataCheckArr.push(`${key}=${params[key]}`);
      });

    const dataCheckString = dataCheckArr.join('\n');
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(config.telegramBotToken)
      .digest();

    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (calculatedHash !== hash) {
      logger.warn('Telegram initData hash mismatch');
      return null;
    }

    const authDate = parseInt(params.auth_date, 10);
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 86400) {
      logger.warn('Telegram initData expired');
      return null;
    }

    if (!params.user) return null;

    const user: TelegramUser = JSON.parse(params.user);

    return {
      user,
      authDate,
      hash,
      startParam: params.start_param,
    };
  } catch (error) {
    logger.error('Failed to validate Telegram initData', { error });
    return null;
  }
}
