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
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
