import { Request, Response } from 'express';
import { SectionService } from '../services/sectionService';
import { BusinessService } from '../services/businessService';
import { getIdParam } from '../utils/request';

export class SectionController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const records = await SectionService.getAll();
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
      const record = await SectionService.getById(id);
      if (!record) {
        res.status(404).json({ error: 'Section not found' });
        return;
      }
      res.json(record);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { title, titleEn, description, descriptionEn, imageUrl, iconUrl } = req.body as {
        title: string;
        titleEn: string;
        description?: string;
        descriptionEn?: string;
        imageUrl?: string;
        iconUrl?: string;
      };
      const files = (req as Request & { files?: Record<string, { filename: string }[]> }).files;
      const imageFile = files?.image?.[0];
      const iconFile = files?.icon?.[0];
      const finalImageUrl = imageFile ? `/uploads/sections/${imageFile.filename}` : imageUrl;
      const finalIconUrl = iconFile ? `/uploads/sections/${iconFile.filename}` : iconUrl;

      if (!title || !titleEn) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const record = await SectionService.create({
        title,
        titleEn,
        description: description ?? null,
        descriptionEn: descriptionEn ?? null,
        imageUrl: finalImageUrl ?? null,
        iconUrl: finalIconUrl ?? null,
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
      const { title, titleEn, description, descriptionEn, imageUrl, iconUrl } = req.body as {
        title?: string;
        titleEn?: string;
        description?: string;
        descriptionEn?: string;
        imageUrl?: string;
        iconUrl?: string;
      };
      const files = (req as Request & { files?: Record<string, { filename: string }[]> }).files;
      const imageFile = files?.image?.[0];
      const iconFile = files?.icon?.[0];
      const finalImageUrl = imageFile ? `/uploads/sections/${imageFile.filename}` : imageUrl;
      const finalIconUrl = iconFile ? `/uploads/sections/${iconFile.filename}` : iconUrl;
      const record = await SectionService.update(id, {
        title,
        titleEn,
        description: description ?? null,
        descriptionEn: descriptionEn ?? null,
        imageUrl: finalImageUrl ?? null,
        iconUrl: finalIconUrl ?? null,
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
      await SectionService.remove(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getBusinesses(req: Request, res: Response): Promise<void> {
    try {
      const id = getIdParam(req);
      if (!id) {
        res.status(400).json({ error: 'Invalid id' });
        return;
      }
      const records = await BusinessService.getBySection(id);
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
