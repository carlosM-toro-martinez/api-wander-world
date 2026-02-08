import { Request, Response } from 'express';
import { PromotionService } from '../services/promotionService';
import { getIdParam } from '../utils/request';

export class PromotionController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const records = await PromotionService.getAll();
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = getIdParam(req);
      if (!id) {
        res.status(400).json({ error: 'Invalid id' });
        return;
      }
      const record = await PromotionService.getById(id);
      if (!record) {
        res.status(404).json({ error: 'Promotion not found' });
        return;
      }
      res.json(record);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { businessId, promotionDetails, promotionDetailsEn, price } = req.body as {
        businessId: number;
        promotionDetails?: string;
        promotionDetailsEn?: string;
        price?: string;
      };

      if (!businessId) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const record = await PromotionService.create({
        businessId,
        promotionDetails: promotionDetails ?? null,
        promotionDetailsEn: promotionDetailsEn ?? null,
        price: price ?? null,
      });

      res.status(201).json(record);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = getIdParam(req);
      if (!id) {
        res.status(400).json({ error: 'Invalid id' });
        return;
      }
      const { promotionDetails, promotionDetailsEn, price } = req.body as {
        promotionDetails?: string;
        promotionDetailsEn?: string;
        price?: string;
      };
      const record = await PromotionService.update(id, {
        promotionDetails: promotionDetails ?? null,
        promotionDetailsEn: promotionDetailsEn ?? null,
        price: price ?? null,
      });
      res.json(record);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async remove(req: Request, res: Response): Promise<void> {
    try {
      const id = getIdParam(req);
      if (!id) {
        res.status(400).json({ error: 'Invalid id' });
        return;
      }
      await PromotionService.remove(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
