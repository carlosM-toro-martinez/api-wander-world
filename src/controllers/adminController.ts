import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { AdminService } from '../services/adminService';
import { getIdParam } from '../utils/request';

export class AdminController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const records = await AdminService.getAll();
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
      const record = await AdminService.getById(id);
      if (!record) {
        res.status(404).json({ error: 'Admin not found' });
        return;
      }
      res.json(record);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { username, password, businessId } = req.body as {
        username: string;
        password: string;
        businessId?: number;
      };

      if (!username || !password) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const record = await AdminService.create({
        username,
        passwordHash,
        businessId: businessId ?? null,
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
      const { username, password, businessId } = req.body as {
        username?: string;
        password?: string;
        businessId?: number;
      };

      const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;
      const record = await AdminService.update(id, {
        username,
        passwordHash,
        businessId: businessId ?? null,
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
      await AdminService.remove(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
