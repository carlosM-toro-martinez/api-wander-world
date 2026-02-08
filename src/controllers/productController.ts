import { Request, Response } from 'express';
import { ProductService } from '../services/productService';
import { getIdParam } from '../utils/request';

export class ProductController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const records = await ProductService.getAll();
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
      const record = await ProductService.getById(id);
      if (!record) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }
      res.json(record);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { businessId, productDetails, productDetailsEn, price } = req.body as {
        businessId: number;
        productDetails?: string;
        productDetailsEn?: string;
        price?: string;
      };

      if (!businessId) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const record = await ProductService.create({
        businessId,
        productDetails: productDetails ?? null,
        productDetailsEn: productDetailsEn ?? null,
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
      const { productDetails, productDetailsEn, price } = req.body as {
        productDetails?: string;
        productDetailsEn?: string;
        price?: string;
      };
      const record = await ProductService.update(id, {
        productDetails: productDetails ?? null,
        productDetailsEn: productDetailsEn ?? null,
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
      await ProductService.remove(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
