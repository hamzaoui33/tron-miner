import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { getConfig } from '../config';
import { validateTelegramInitData } from './telegram.service';
import { miningService } from './mining.service';
import { toNumber } from '../utils/decimal';
import logger from '../utils/logger';

export interface JwtPayload {
  userId: string;
  telegramId: string;
}

export class AuthService {
  generateToken(payload: JwtPayload): string {
    const { jwtSecret, jwtExpiresIn } = getConfig();
    return jwt.sign(payload, jwtSecret, {
      expiresIn: jwtExpiresIn as jwt.SignOptions['expiresIn'],
    });
  }

  verifyToken(token: string): JwtPayload {
    return jwt.verify(token, getConfig().jwtSecret) as JwtPayload;
  }

  async authenticateWithTelegram(initData: string) {
    const parsed = validateTelegramInitData(initData);
    if (!parsed) {
      throw new Error('Invalid Telegram authentication data');
    }

    const telegramId = String(parsed.user.id);
    let user = await prisma.user.findUnique({ where: { telegramId } });

    if (!user) {
      let referredById: string | undefined;
      if (parsed.startParam) {
        const referrer = await prisma.user.findUnique({
          where: { telegramId: parsed.startParam },
        });
        if (referrer) referredById = referrer.id;
      }

      user = await prisma.user.create({
        data: {
          telegramId,
          username: parsed.user.username,
          firstName: parsed.user.first_name,
          photoUrl: parsed.user.photo_url,
          miningRate: miningService.getMiningRateForLevel(1),
          referredById,
        },
      });

      if (referredById) {
        await prisma.referral.create({
          data: {
            referrerId: referredById,
            referredUserId: user.id,
          },
        });
      }

      logger.info('New user registered', { telegramId, userId: user.id });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          username: parsed.user.username,
          firstName: parsed.user.first_name,
          photoUrl: parsed.user.photo_url,
        },
      });
    }

    if (user.isBanned) {
      throw new Error('Account is banned');
    }

    const token = this.generateToken({
      userId: user.id,
      telegramId: user.telegramId,
    });

    return { user, token };
  }

  formatUserResponse(user: Awaited<ReturnType<typeof prisma.user.findUniqueOrThrow>>) {
    return {
      id: user.id,
      telegramId: user.telegramId,
      username: user.username,
      firstName: user.firstName,
      photoUrl: user.photoUrl,
      balance: toNumber(user.balance),
      miningRate: toNumber(user.miningRate),
      minerLevel: user.minerLevel,
      xp: user.xp,
      userLevel: user.userLevel,
      dailyStreak: user.dailyStreak,
      createdAt: user.createdAt,
    };
  }
}

export const authService = new AuthService();
