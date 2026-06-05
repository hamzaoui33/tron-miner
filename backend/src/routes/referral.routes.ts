import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { referralService } from '../services/referral.service';

const router = Router();

router.get(
  '/',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res) => {
    const stats = await referralService.getReferralStats(req.userId!);
    res.json(stats);
  })
);

export default router;
