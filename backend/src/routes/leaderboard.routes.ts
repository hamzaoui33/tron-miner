import { Router } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { leaderboardService } from '../services/leaderboard.service';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const leaderboard = await leaderboardService.getLeaderboard();
    res.json(leaderboard);
  })
);

export default router;
