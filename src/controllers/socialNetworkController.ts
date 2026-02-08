import { Request, Response } from 'express';
import { SocialNetworkService } from '../services/socialNetworkService';
import { getIdParam } from '../utils/request';

export class SocialNetworkController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const records = await SocialNetworkService.getAll();
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
      const record = await SocialNetworkService.getById(id);
      if (!record) {
        res.status(404).json({ error: 'Social network not found' });
        return;
      }
      res.json(record);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { businessId, facebookUrl, instagramUrl, twitterUrl, tiktokUrl, whatsappNumber } =
        req.body as {
          businessId: number;
          facebookUrl?: string;
          instagramUrl?: string;
          twitterUrl?: string;
          tiktokUrl?: string;
          whatsappNumber?: string;
        };

      if (!businessId) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const record = await SocialNetworkService.create({
        businessId,
        facebookUrl: facebookUrl ?? null,
        instagramUrl: instagramUrl ?? null,
        twitterUrl: twitterUrl ?? null,
        tiktokUrl: tiktokUrl ?? null,
        whatsappNumber: whatsappNumber ?? null,
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
      const { facebookUrl, instagramUrl, twitterUrl, tiktokUrl, whatsappNumber } = req.body as {
        facebookUrl?: string;
        instagramUrl?: string;
        twitterUrl?: string;
        tiktokUrl?: string;
        whatsappNumber?: string;
      };
      const record = await SocialNetworkService.update(id, {
        facebookUrl: facebookUrl ?? null,
        instagramUrl: instagramUrl ?? null,
        twitterUrl: twitterUrl ?? null,
        tiktokUrl: tiktokUrl ?? null,
        whatsappNumber: whatsappNumber ?? null,
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
      await SocialNetworkService.remove(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
