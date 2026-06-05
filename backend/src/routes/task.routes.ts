import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { taskService } from '../services/task.service';

const router = Router();

const completeTaskSchema = z.object({
  taskId: z.string().min(1),
});

router.get(
  '/',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res) => {
    const tasks = await taskService.getTasks(req.userId!);
    res.json({ tasks });
  })
);

router.post(
  '/complete',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res) => {
    const { taskId } = completeTaskSchema.parse(req.body);
    const result = await taskService.completeTask(req.userId!, taskId);
    res.json(result);
  })
);

export default router;
