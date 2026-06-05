import { Router } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

const telegramAuthSchema = z.object({
  initData: z.string().min(1),
});

router.post(
  '/telegram',
  asyncHandler(async (req, res) => {
    const { initData } = telegramAuthSchema.parse(req.body);
    const { user, token } = await authService.authenticateWithTelegram(initData);

    res.json({
      token,
      user: authService.formatUserResponse(user),
    });
  })
);

export default router;
