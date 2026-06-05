import { MiningSession } from '@prisma/client';
import { prisma } from '../lib/prisma';
import {
  MINING_SESSION_DURATION_MS,
  MINER_LEVELS,
  REFERRAL_BONUS_PERCENT,
  STREAK_BONUS_PERCENT,
} from '../constants/game';
import { toNumber, toDecimal } from '../utils/decimal';
import { gamificationService } from './gamification.service';
import logger from '../utils/logger';

export class MiningService {
  getMiningRateForLevel(level: number): number {
    const config = MINER_LEVELS[level as keyof typeof MINER_LEVELS];
    return config?.rate ?? MINER_LEVELS[1].rate;
  }

  calculateEarnedAmount(session: MiningSession, miningRate: number): number {
    const startTime = session.startedAt.getTime();
    const endTime = session.endedAt
      ? session.endedAt.getTime()
      : Math.min(Date.now(), startTime + MINING_SESSION_DURATION_MS);
    const elapsedMs = endTime - startTime;
    const hours = elapsedMs / (1000 * 60 * 60);
    return Math.min(hours * miningRate, miningRate * 24);
  }

  getSessionStatus(session: MiningSession | null) {
    if (!session) {
      return { isActive: false, canClaim: false, canStart: true, timeRemaining: 0, earnedSoFar: 0 };
    }

    const now = Date.now();
    const startTime = session.startedAt.getTime();
    const sessionEnd = startTime + MINING_SESSION_DURATION_MS;
    const isExpired = now >= sessionEnd;
    const isActive = !session.claimed && !isExpired;

    return {
      isActive,
      canClaim: !session.claimed && isExpired,
      canStart: session.claimed,
      timeRemaining: isActive ? Math.max(0, sessionEnd - now) : 0,
      isExpired,
      sessionEnd,
    };
  }

  async getActiveSession(userId: string) {
    return prisma.miningSession.findFirst({
      where: { userId, claimed: false },
      orderBy: { startedAt: 'desc' },
    });
  }

  async startMining(userId: string) {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (user.isBanned) throw new Error('Account is banned');

    const activeSession = await this.getActiveSession(userId);
    if (activeSession) {
      const status = this.getSessionStatus(activeSession);
      if (!status.canStart) {
        throw new Error('Cannot start mining. Claim existing rewards first.');
      }
    }

    const session = await prisma.miningSession.create({
      data: { userId },
    });

    await gamificationService.checkAndUnlockAchievement(userId, 'first_mine');
    logger.info('Mining started', { userId, sessionId: session.id });

    return session;
  }

  async stopMining(userId: string) {
    const session = await this.getActiveSession(userId);
    if (!session) throw new Error('No active mining session');

    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const earned = this.calculateEarnedAmount(session, toNumber(user.miningRate));

    const updated = await prisma.miningSession.update({
      where: { id: session.id },
      data: {
        endedAt: new Date(),
        earnedAmount: toDecimal(earned),
      },
    });

    return updated;
  }

  async claimRewards(userId: string) {
    const session = await this.getActiveSession(userId);
    if (!session) throw new Error('No mining session to claim');

    const status = this.getSessionStatus(session);
    if (!status.canClaim && !status.isExpired) {
      if (status.isActive) {
        throw new Error('Mining session still active. Wait for it to complete.');
      }
    }

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { referredBy: true },
    });

    let earned = this.calculateEarnedAmount(session, toNumber(user.miningRate));

    const streakBonus = STREAK_BONUS_PERCENT[user.dailyStreak] ?? 0;
    if (streakBonus > 0) {
      earned = earned * (1 + streakBonus);
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.miningSession.update({
        where: { id: session.id },
        data: {
          claimed: true,
          endedAt: session.endedAt ?? new Date(),
          earnedAmount: toDecimal(earned),
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { balance: { increment: toDecimal(earned) } },
      });

      if (user.referredById) {
        const referralBonus = earned * REFERRAL_BONUS_PERCENT;
        await tx.user.update({
          where: { id: user.referredById },
          data: { balance: { increment: toDecimal(referralBonus) } },
        });
        await tx.referral.updateMany({
          where: { referrerId: user.referredById, referredUserId: userId },
          data: { rewardEarned: { increment: toDecimal(referralBonus) } },
        });
      }

      return { earned, streakBonus };
    });

    await gamificationService.addXpFromMining(userId, earned);
    await gamificationService.checkAndUnlockAchievement(userId, 'first_claim');
    await gamificationService.checkAchievements(userId);

    logger.info('Mining rewards claimed', { userId, earned: result.earned });

    return result;
  }

  async getMiningStatus(userId: string) {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const session = await this.getActiveSession(userId);
    const status = this.getSessionStatus(session);
    const earnedSoFar = session
      ? this.calculateEarnedAmount(session, toNumber(user.miningRate))
      : 0;

    return {
      ...status,
      session,
      miningRate: toNumber(user.miningRate),
      minerLevel: user.minerLevel,
      earnedSoFar,
      balance: toNumber(user.balance),
    };
  }
}

export const miningService = new MiningService();
