import { Request, Response } from 'express';
import { ImageService } from '../services/imageService';
import { getIdParam } from '../utils/request';

export class ImageController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const records = await ImageService.getAll();
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
      const record = await ImageService.getById(id);
      if (!record) {
        res.status(404).json({ error: 'Image not found' });
        return;
      }
      res.json(record);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { businessId, imageUrl } = req.body as {
        businessId: number;
        imageUrl?: string;
      };
      const uploadedImage = (req as Request & { file?: { filename: string } }).file;
      const finalImageUrl = uploadedImage ? `/uploads/images/${uploadedImage.filename}` : imageUrl;

      if (!businessId) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const record = await ImageService.create({
        businessId,
        imageUrl: finalImageUrl ?? null,
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
      const { imageUrl } = req.body as { imageUrl?: string };
      const uploadedImage = (req as Request & { file?: { filename: string } }).file;
      const finalImageUrl = uploadedImage ? `/uploads/images/${uploadedImage.filename}` : imageUrl;
      const record = await ImageService.update(id, { imageUrl: finalImageUrl ?? null });
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
      await ImageService.remove(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
