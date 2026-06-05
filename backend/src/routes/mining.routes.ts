import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { miningService } from '../services/mining.service';

const router = Router();

router.post(
  '/start',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res) => {
    const session = await miningService.startMining(req.userId!);
    const status = await miningService.getMiningStatus(req.userId!);
    res.json({ session, status });
  })
);

router.post(
  '/stop',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res) => {
    const session = await miningService.stopMining(req.userId!);
    const status = await miningService.getMiningStatus(req.userId!);
    res.json({ session, status });
  })
);

router.post(
  '/claim',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res) => {
    const result = await miningService.claimRewards(req.userId!);
    const status = await miningService.getMiningStatus(req.userId!);
    res.json({ ...result, status });
  })
);

router.get(
  '/status',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res) => {
    const status = await miningService.getMiningStatus(req.userId!);
    res.json(status);
  })
);

export default router;
