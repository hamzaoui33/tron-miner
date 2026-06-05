import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import miningRoutes from './mining.routes';
import upgradeRoutes from './upgrade.routes';
import referralRoutes from './referral.routes';
import dailyRewardRoutes from './dailyReward.routes';
import taskRoutes from './task.routes';
import leaderboardRoutes from './leaderboard.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/mining', miningRoutes);
router.use('/upgrade', upgradeRoutes);
router.use('/referrals', referralRoutes);
router.use('/daily-reward', dailyRewardRoutes);
router.use('/tasks', taskRoutes);
router.use('/leaderboard', leaderboardRoutes);

router.get('/health', (_req, res) => {
  const configured = !!(process.env.DATABASE_URL && process.env.TELEGRAM_BOT_TOKEN && process.env.JWT_SECRET);
  res.json({
    status: 'ok',
    configured,
    timestamp: new Date().toISOString(),
    missing: [
      !process.env.DATABASE_URL && 'DATABASE_URL',
      !process.env.TELEGRAM_BOT_TOKEN && 'TELEGRAM_BOT_TOKEN',
      !process.env.JWT_SECRET && 'JWT_SECRET',
    ].filter(Boolean),
  });
});

export default router;
