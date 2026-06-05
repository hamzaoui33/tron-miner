import { prisma } from '../lib/prisma';
import { toDecimal } from '../utils/decimal';
import { taskService } from './task.service';
import logger from '../utils/logger';

/**
 * Admin service layer - prepared for future admin panel.
 * All methods should be protected by admin middleware.
 */
export class AdminService {
  async banUser(userId: string, banned = true) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isBanned: banned },
    });
    logger.info(`User ${banned ? 'banned' : 'unbanned'}`, { userId });
    return user;
  }

  async adjustBalance(userId: string, amount: number, operation: 'add' | 'set' | 'subtract') {
    if (operation === 'set') {
      return prisma.user.update({
        where: { id: userId },
        data: { balance: toDecimal(amount) },
      });
    }

    return prisma.user.update({
      where: { id: userId },
      data: {
        balance: operation === 'add'
          ? { increment: toDecimal(amount) }
          : { decrement: toDecimal(amount) },
      },
    });
  }

  async getAllUsers(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          telegramId: true,
          username: true,
          firstName: true,
          balance: true,
          minerLevel: true,
          isBanned: true,
          createdAt: true,
        },
      }),
      prisma.user.count(),
    ]);

    return { users, total, page, limit };
  }

  createTask = taskService.createTask.bind(taskService);
  updateTask = taskService.updateTask.bind(taskService);
  deleteTask = taskService.deleteTask.bind(taskService);
}

export const adminService = new AdminService();
