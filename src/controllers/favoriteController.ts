import { Request, Response } from 'express';
import { FavoriteService } from '../services/favoriteService';

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
      const record = await FavoriteService.create({ userId, destinationId });
      res.status(201).json(record);
    } catch (error) {
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
}
