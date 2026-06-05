import { prisma } from '../lib/prisma';
import { ACHIEVEMENTS, XP_PER_LEVEL, XP_PER_TRX_MINED } from '../constants/game';
import { toNumber } from '../utils/decimal';
import logger from '../utils/logger';

export class GamificationService {
  async addXp(userId: string, amount: number): Promise<{ newXp: number; newLevel: number; leveledUp: boolean }> {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const newXp = user.xp + amount;
    const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;
    const leveledUp = newLevel > user.userLevel;

    await prisma.user.update({
      where: { id: userId },
      data: { xp: newXp, userLevel: newLevel },
    });

    return { newXp, newLevel, leveledUp };
  }

  async addXpFromMining(userId: string, trxEarned: number): Promise<void> {
    const xpGain = Math.floor(trxEarned * XP_PER_TRX_MINED);
    if (xpGain > 0) {
      await this.addXp(userId, xpGain);
    }
  }

  async checkAndUnlockAchievement(userId: string, achievementKey: string): Promise<boolean> {
    const achievement = await prisma.achievement.findUnique({
      where: { key: achievementKey },
    });

    if (!achievement) return false;

    const existing = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: { userId, achievementId: achievement.id },
      },
    });

    if (existing) return false;

    await prisma.$transaction([
      prisma.userAchievement.create({
        data: { userId, achievementId: achievement.id },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          balance: { increment: achievement.trxReward },
          xp: { increment: achievement.xpReward },
        },
      }),
    ]);

    logger.info('Achievement unlocked', { userId, achievementKey });
    return true;
  }

  async checkAchievements(userId: string): Promise<string[]> {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: {
        miningSessions: { where: { claimed: true }, take: 1 },
        referralsMade: true,
        achievements: { include: { achievement: true } },
      },
    });

    const unlocked: string[] = [];
    const unlockedKeys = new Set(user.achievements.map((a) => a.achievement.key));

    const checks: Array<{ key: string; condition: boolean }> = [
      { key: 'first_mine', condition: user.miningSessions.length > 0 },
      { key: 'level_2', condition: user.minerLevel >= 2 },
      { key: 'level_5', condition: user.minerLevel >= 5 },
      { key: 'first_referral', condition: user.referralsMade.length > 0 },
      { key: 'streak_7', condition: user.dailyStreak >= 7 },
      { key: 'balance_1000', condition: toNumber(user.balance) >= 1000 },
    ];

    for (const check of checks) {
      if (check.condition && !unlockedKeys.has(check.key)) {
        const success = await this.checkAndUnlockAchievement(userId, check.key);
        if (success) unlocked.push(check.key);
      }
    }

    return unlocked;
  }

  async seedAchievements(): Promise<void> {
    for (const ach of ACHIEVEMENTS) {
      await prisma.achievement.upsert({
        where: { key: ach.key },
        update: {
          title: ach.title,
          description: ach.description,
          xpReward: ach.xpReward,
          trxReward: ach.trxReward,
        },
        create: {
          key: ach.key,
          title: ach.title,
          description: ach.description,
          xpReward: ach.xpReward,
          trxReward: ach.trxReward,
        },
      });
    }
  }
}

export const gamificationService = new GamificationService();
