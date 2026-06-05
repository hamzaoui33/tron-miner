import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { upgradeService } from '../services/upgrade.service';

const router = Router();

const upgradeSchema = z.object({
  targetLevel: z.number().int().min(2).max(5).optional(),
});

router.get(
  '/levels',
  authMiddleware,
  asyncHandler(async (_req, res) => {
    res.json({ levels: upgradeService.getAllLevels() });
  })
);

router.post(
  '/',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res) => {
    const { targetLevel } = upgradeSchema.parse(req.body);
    const result = await upgradeService.upgrade(req.userId!, targetLevel);
    res.json(result);
  })
);

export default router;
