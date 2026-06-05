import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { dailyRewardService } from '../services/dailyReward.service';

const router = Router();

router.get(
  '/status',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res) => {
    const status = await dailyRewardService.getStatus(req.userId!);
    res.json(status);
  })
);

router.post(
  '/claim',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res) => {
    const result = await dailyRewardService.claim(req.userId!);
    res.json(result);
  })
);

export default router;
