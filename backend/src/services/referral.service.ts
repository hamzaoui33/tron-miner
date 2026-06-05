import { prisma } from '../lib/prisma';
import { BOT_USERNAME } from '../constants/game';
import { toNumber } from '../utils/decimal';

export class ReferralService {
  getReferralLink(telegramId: string): string {
    return `https://t.me/${BOT_USERNAME}?start=${telegramId}`;
  }

  async getReferralStats(userId: string) {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        referredUser: {
          select: {
            id: true,
            username: true,
            firstName: true,
            photoUrl: true,
            miningSessions: {
              where: { claimed: false },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalReferrals = referrals.length;
    const activeReferrals = referrals.filter(
      (r) => r.referredUser.miningSessions.length > 0
    ).length;
    const totalRewardsEarned = referrals.reduce(
      (sum, r) => sum + toNumber(r.rewardEarned),
      0
    );

    return {
      referralLink: this.getReferralLink(user.telegramId),
      totalReferrals,
      activeReferrals,
      totalRewardsEarned,
      referrals: referrals.map((r) => ({
        id: r.id,
        username: r.referredUser.username,
        firstName: r.referredUser.firstName,
        photoUrl: r.referredUser.photoUrl,
        rewardEarned: toNumber(r.rewardEarned),
        isActive: r.isActive,
        createdAt: r.createdAt,
      })),
    };
  }
}

export const referralService = new ReferralService();
