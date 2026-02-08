import { Request, Response } from 'express';
import { OpeningHoursService } from '../services/openingHoursService';
import { getIdParam } from '../utils/request';

export class OpeningHoursController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const records = await OpeningHoursService.getAll();
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
      const record = await OpeningHoursService.getById(id);
      if (!record) {
        res.status(404).json({ error: 'Opening hours not found' });
        return;
      }
      res.json(record);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { businessId, weekend, morningHours, afternoonHours } = req.body as {
        businessId: number;
        weekend?: string;
        morningHours?: string[];
        afternoonHours?: string[];
      };

      if (!businessId) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const record = await OpeningHoursService.create({
        businessId,
        weekend: weekend ?? null,
        morningHours: morningHours ?? [],
        afternoonHours: afternoonHours ?? [],
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
      const { weekend, morningHours, afternoonHours } = req.body as {
        weekend?: string;
        morningHours?: string[];
        afternoonHours?: string[];
      };
      const record = await OpeningHoursService.update(id, {
        weekend: weekend ?? null,
        morningHours: morningHours ?? [],
        afternoonHours: afternoonHours ?? [],
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
      await OpeningHoursService.remove(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
