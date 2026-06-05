import { prisma } from '../lib/prisma';
import { toNumber } from '../utils/decimal';

export class LeaderboardService {
  async getTopBalances(limit = 100) {
    const users = await prisma.user.findMany({
      where: { isBanned: false },
      orderBy: { balance: 'desc' },
      take: limit,
      select: {
        id: true,
        username: true,
        firstName: true,
        photoUrl: true,
        balance: true,
        minerLevel: true,
        userLevel: true,
      },
    });

    return users.map((u, i) => ({
      rank: i + 1,
      id: u.id,
      username: u.username,
      firstName: u.firstName,
      photoUrl: u.photoUrl,
      balance: toNumber(u.balance),
      minerLevel: u.minerLevel,
      userLevel: u.userLevel,
    }));
  }

  async getTopMiners(limit = 100) {
    const users = await prisma.user.findMany({
      where: { isBanned: false },
      orderBy: { miningRate: 'desc' },
      take: limit,
      select: {
        id: true,
        username: true,
        firstName: true,
        photoUrl: true,
        miningRate: true,
        minerLevel: true,
      },
    });

    return users.map((u, i) => ({
      rank: i + 1,
      id: u.id,
      username: u.username,
      firstName: u.firstName,
      photoUrl: u.photoUrl,
      miningRate: toNumber(u.miningRate),
      minerLevel: u.minerLevel,
    }));
  }

  async getTopReferrals(limit = 100) {
    const results = await prisma.referral.groupBy({
      by: ['referrerId'],
      _count: { referredUserId: true },
      _sum: { rewardEarned: true },
      orderBy: { _count: { referredUserId: 'desc' } },
      take: limit,
    });

    const userIds = results.map((r) => r.referrerId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        username: true,
        firstName: true,
        photoUrl: true,
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    return results.map((r, i) => {
      const user = userMap.get(r.referrerId);
      return {
        rank: i + 1,
        id: r.referrerId,
        username: user?.username,
        firstName: user?.firstName,
        photoUrl: user?.photoUrl,
        referralCount: r._count.referredUserId,
        totalRewards: toNumber(r._sum.rewardEarned ?? 0),
      };
    });
  }

  async getLeaderboard() {
    const [balances, miners, referrals] = await Promise.all([
      this.getTopBalances(),
      this.getTopMiners(),
      this.getTopReferrals(),
    ]);

    return { balances, miners, referrals };
  }
}

export const leaderboardService = new LeaderboardService();
