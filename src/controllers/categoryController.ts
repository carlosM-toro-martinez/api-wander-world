import { Request, Response } from 'express';
import { CategoryService } from '../services/categoryService';
import { getIdParam } from '../utils/request';

type CategoryRecord = Awaited<ReturnType<typeof CategoryService.getAll>>[number];

export class CategoryController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const records = await CategoryService.getAll();
      res.json(
        records.map((record: CategoryRecord) => ({
          id: record.id,
          title: record.title,
          count: record.count || record._count.destinations,
          image: record.imageUrl ?? '',
        })),
      );
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
      const record = await CategoryService.getById(id);
      if (!record) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }
      res.json({
        id: record.id,
        title: record.title,
        count: record.count || record._count.destinations,
        image: record.imageUrl ?? '',
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { title, image, count } = req.body as {
        title: string;
        image?: string;
        count?: number;
      };
      const uploadedImage = (req as Request & { file?: { filename: string } }).file;
      const imageUrl = uploadedImage ? `/uploads/categories/${uploadedImage.filename}` : image;

      if (!title) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const record = await CategoryService.create({
        title,
        imageUrl: imageUrl ?? null,
        count,
      });

      res.status(201).json({
        id: record.id,
        title: record.title,
        count: record.count,
        image: record.imageUrl ?? '',
      });
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
      const { title, image, count } = req.body as {
        title?: string;
        image?: string;
        count?: number;
      };
      const uploadedImage = (req as Request & { file?: { filename: string } }).file;
      const imageUrl = uploadedImage ? `/uploads/categories/${uploadedImage.filename}` : image;
      const record = await CategoryService.update(id, {
        title,
        imageUrl: imageUrl ?? null,
        count,
      });
      res.json({
        id: record.id,
        title: record.title,
        count: record.count,
        image: record.imageUrl ?? '',
      });
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
      await CategoryService.remove(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
