import { prisma } from '../lib/prisma';
import { toNumber, toDecimal } from '../utils/decimal';
import { gamificationService } from './gamification.service';
import logger from '../utils/logger';

export class TaskService {
  async getTasks(userId: string) {
    const tasks = await prisma.task.findMany({
      where: { active: true },
      include: {
        completions: {
          where: { userId },
          take: 1,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      reward: toNumber(task.reward),
      type: task.type,
      url: task.url,
      completed: task.completions.length > 0,
      completedAt: task.completions[0]?.completedAt ?? null,
    }));
  }

  async completeTask(userId: string, taskId: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task || !task.active) throw new Error('Task not found or inactive');

    const existing = await prisma.taskCompletion.findUnique({
      where: { userId_taskId: { userId, taskId } },
    });

    if (existing) throw new Error('Task already completed');

    await prisma.$transaction([
      prisma.taskCompletion.create({
        data: { userId, taskId },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { balance: { increment: task.reward } },
      }),
    ]);

    await gamificationService.addXp(userId, Math.floor(toNumber(task.reward)));
    logger.info('Task completed', { userId, taskId, reward: toNumber(task.reward) });

    return {
      reward: toNumber(task.reward),
      taskTitle: task.title,
    };
  }

  // Admin-ready methods
  async createTask(data: {
    title: string;
    description?: string;
    reward: number;
    type?: string;
    url?: string;
  }) {
    return prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        reward: toDecimal(data.reward),
        type: data.type ?? 'custom',
        url: data.url,
      },
    });
  }

  async updateTask(
    taskId: string,
    data: Partial<{ title: string; description: string; reward: number; active: boolean; url: string }>
  ) {
    return prisma.task.update({
      where: { id: taskId },
      data: {
        ...data,
        reward: data.reward !== undefined ? toDecimal(data.reward) : undefined,
      },
    });
  }

  async deleteTask(taskId: string) {
    return prisma.task.update({
      where: { id: taskId },
      data: { active: false },
    });
  }
}

export const taskService = new TaskService();
