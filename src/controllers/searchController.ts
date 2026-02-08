import { Request, Response } from 'express';
export class SearchController {
  static async getPopular(req: Request, res: Response): Promise<void> {
    try {
      res.json([]);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getRecent(req: Request, res: Response): Promise<void> {
    try {
      res.json([]);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
