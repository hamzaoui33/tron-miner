import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { authService } from '../services/auth.service';
import { miningService } from '../services/mining.service';
const router = Router();

router.get(
  '/',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res) => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: req.userId },
      include: {
        achievements: { include: { achievement: true } },
      },
    });

    const miningStatus = await miningService.getMiningStatus(req.userId!);

    res.json({
      user: authService.formatUserResponse(user),
      mining: miningStatus,
      achievements: user.achievements.map((ua) => ({
        key: ua.achievement.key,
        title: ua.achievement.title,
        description: ua.achievement.description,
        unlockedAt: ua.unlockedAt,
      })),
    });
  })
);

export default router;
