import { prisma } from '../lib/prisma';
import { DAILY_REWARDS } from '../constants/game';
import { toNumber, toDecimal } from '../utils/decimal';
import { gamificationService } from './gamification.service';
import logger from '../utils/logger';

export class DailyRewardService {
  isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getUTCFullYear() === date2.getUTCFullYear() &&
      date1.getUTCMonth() === date2.getUTCMonth() &&
      date1.getUTCDate() === date2.getUTCDate()
    );
  }

  isYesterday(date: Date, today: Date): boolean {
    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    return this.isSameDay(date, yesterday);
  }

  getRewardForDay(dayNumber: number): number {
    const index = Math.min(dayNumber - 1, DAILY_REWARDS.length - 1);
    return DAILY_REWARDS[index];
  }

  async getStatus(userId: string) {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const now = new Date();

    const claimedToday =
      user.lastDailyClaim && this.isSameDay(user.lastDailyClaim, now);

    const currentDay = claimedToday
      ? user.dailyStreak
      : user.dailyStreak + (user.lastDailyClaim ? 1 : 1);

    const effectiveDay = Math.min(currentDay, DAILY_REWARDS.length);
    const nextReward = this.getRewardForDay(
      claimedToday ? user.dailyStreak : effectiveDay
    );

    return {
      streak: user.dailyStreak,
      canClaim: !claimedToday,
      claimedToday,
      nextReward,
      currentDay: effectiveDay,
      rewards: DAILY_REWARDS.map((amount, i) => ({
        day: i + 1,
        amount,
        claimed: i < user.dailyStreak,
        isToday: !claimedToday && i + 1 === effectiveDay,
      })),
      lastClaim: user.lastDailyClaim,
    };
  }

  async claim(userId: string) {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const now = new Date();

    if (user.lastDailyClaim && this.isSameDay(user.lastDailyClaim, now)) {
      throw new Error('Daily reward already claimed today');
    }

    let newStreak = 1;
    if (user.lastDailyClaim && this.isYesterday(user.lastDailyClaim, now)) {
      newStreak = user.dailyStreak + 1;
    }

    const dayNumber = Math.min(newStreak, DAILY_REWARDS.length);
    const reward = this.getRewardForDay(dayNumber);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          balance: { increment: toDecimal(reward) },
          dailyStreak: newStreak,
          lastDailyClaim: now,
        },
      }),
      prisma.dailyReward.create({
        data: { userId, dayNumber },
      }),
    ]);

    await gamificationService.addXp(userId, Math.floor(reward / 2));
    await gamificationService.checkAchievements(userId);

    logger.info('Daily reward claimed', { userId, dayNumber, reward });

    return { reward, streak: newStreak, dayNumber };
  }
}

export const dailyRewardService = new DailyRewardService();
