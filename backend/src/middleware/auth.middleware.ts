import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { prisma } from '../lib/prisma';
import { getConfig } from '../config';

export interface AuthRequest extends Request {
  userId?: string;
  telegramId?: string;
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.slice(7);
    const payload = authService.verifyToken(token);

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || user.isBanned) {
      return res.status(401).json({ error: 'User not found or banned' });
    }

    req.userId = payload.userId;
    req.telegramId = payload.telegramId;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.telegramId || !getConfig().adminTelegramIds.includes(req.telegramId)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}
