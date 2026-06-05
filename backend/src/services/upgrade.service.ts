import { prisma } from '../lib/prisma';
import { MAX_MINER_LEVEL, MINER_LEVELS } from '../constants/game';
import { toNumber, toDecimal } from '../utils/decimal';
import { gamificationService } from './gamification.service';
import logger from '../utils/logger';

export class UpgradeService {
  getUpgradeInfo(currentLevel: number) {
    const nextLevel = currentLevel + 1;
    if (nextLevel > MAX_MINER_LEVEL) {
      return { canUpgrade: false, nextLevel: null, cost: null, newRate: null };
    }

    const next = MINER_LEVELS[nextLevel as keyof typeof MINER_LEVELS];
    return {
      canUpgrade: true,
      nextLevel,
      cost: next.cost,
      newRate: next.rate,
      currentRate: MINER_LEVELS[currentLevel as keyof typeof MINER_LEVELS].rate,
    };
  }

  getAllLevels() {
    return Object.entries(MINER_LEVELS).map(([level, data]) => ({
      level: parseInt(level, 10),
      rate: data.rate,
      cost: data.cost,
    }));
  }

  async upgrade(userId: string, targetLevel?: number) {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (user.isBanned) throw new Error('Account is banned');

    const nextLevel = targetLevel ?? user.minerLevel + 1;

    if (nextLevel <= user.minerLevel) {
      throw new Error('Cannot downgrade or upgrade to same level');
    }

    if (nextLevel > MAX_MINER_LEVEL) {
      throw new Error('Maximum miner level reached');
    }

    const levelConfig = MINER_LEVELS[nextLevel as keyof typeof MINER_LEVELS];
    const balance = toNumber(user.balance);

    if (balance < levelConfig.cost) {
      throw new Error(`Insufficient balance. Need ${levelConfig.cost} TRX`);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        minerLevel: nextLevel,
        miningRate: toDecimal(levelConfig.rate),
        balance: { decrement: toDecimal(levelConfig.cost) },
      },
    });

    await gamificationService.checkAchievements(userId);
    logger.info('Miner upgraded', { userId, newLevel: nextLevel });

    return {
      minerLevel: updated.minerLevel,
      miningRate: toNumber(updated.miningRate),
      balance: toNumber(updated.balance),
      cost: levelConfig.cost,
    };
  }
}

export const upgradeService = new UpgradeService();
