import { Request, Response } from 'express';
import { FavoriteService } from '../services/favoriteService';

function getUserId(req: Request): number | null {
  const authUser = (req as Request & { user?: { userId?: number } }).user;
  const raw =
    authUser?.userId ??
    (req.query.userId as string | undefined) ??
    (req.body as { userId?: number | string }).userId;
  const userId = Number(raw);
  return Number.isNaN(userId) || userId <= 0 ? null : userId;
}

export class FavoriteController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.query as { userId?: string };
      if (userId) {
        const records = await FavoriteService.getByUser(parseInt(userId, 10));
        res.json(records);
        return;
      }
      const records = await FavoriteService.getAll();
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { userId, destinationId } = req.body as {
        userId: number;
        destinationId: number;
      };
      if (!userId || !destinationId) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }
      const record = await FavoriteService.create({
        userId: Number(userId),
        destinationId: Number(destinationId),
      });
      res.status(201).json(record);
    } catch (error) {
      const prismaError = error as { code?: string };
      if (prismaError?.code === 'P2002') {
        res.status(409).json({ error: 'Favorite already exists' });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async remove(req: Request, res: Response): Promise<void> {
    try {
      const { userId, destinationId } = req.body as {
        userId: number;
        destinationId: number;
      };
      if (!userId || !destinationId) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }
      await FavoriteService.remove({ userId, destinationId });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async removeByDestination(req: Request, res: Response): Promise<void> {
    try {
      const destinationId = Number(req.params.destinationId);
      const userId = getUserId(req);
      if (!userId || !destinationId || Number.isNaN(destinationId)) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }
      await FavoriteService.remove({ userId, destinationId });
      res.status(204).send();
    } catch (error) {
      const prismaError = error as { code?: string };
      if (prismaError?.code === 'P2025') {
        res.status(404).json({ error: 'Favorite not found' });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
