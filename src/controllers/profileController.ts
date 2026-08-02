import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { UserService } from '../services/userService';
import { FavoriteService } from '../services/favoriteService';
import { getIdParam } from '../utils/request';
import { mapUserToProfile } from '../utils/profileMapper';
import { mapDestination } from '../utils/destinationMapper';

function getCurrentUserId(req: Request): number | null {
  const authUser = (req as Request & { user?: { userId?: number } }).user;
  const raw =
    authUser?.userId ??
    (req.query.userId as string | undefined) ??
    (req.body as { userId?: number | string }).userId;
  const userId = Number(raw);
  return Number.isNaN(userId) || userId <= 0 ? null : userId;
}

export class ProfileController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const users = await UserService.getAll();
      res.json(users.map(mapUserToProfile));
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
      const user = await UserService.getById(id);
      if (!user) {
        res.status(404).json({ error: 'Profile not found' });
        return;
      }
      res.json(mapUserToProfile(user));
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const {
        name,
        email,
        password,
        initials,
        avatarUrl,
        phone,
        country,
        stats,
        favoriteDestinationIds,
      } = req.body as {
        name: string;
        email: string;
        password: string;
        initials?: string;
        avatarUrl?: string;
        phone?: string;
        country?: string;
        stats?: { trips: number; countries: number; favorites: number };
        favoriteDestinationIds?: number[];
      };
      const files = (req as Request & { files?: Record<string, { filename: string }[]> }).files;
      const avatarFile = files?.avatar?.[0] ?? files?.image?.[0];
      const finalAvatarUrl = avatarFile ? `/uploads/profiles/${avatarFile.filename}` : avatarUrl;

      if (!name || !email || !password) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await UserService.create({
        name,
        email,
        passwordHash,
        initials: initials ?? null,
        avatarUrl: finalAvatarUrl ?? null,
        phone: phone ?? null,
        country: country ?? null,
        stats: stats
          ? {
              trips: stats.trips,
              countries: stats.countries,
              favorites: stats.favorites,
            }
          : undefined,
        favoriteDestinationIds,
      });

      res.status(201).json(mapUserToProfile(user));
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
      const { name, email, password, initials, avatarUrl, phone, country } = req.body as {
        name?: string;
        email?: string;
        password?: string;
        initials?: string;
        avatarUrl?: string;
        phone?: string;
        country?: string;
      };
      const files = (req as Request & { files?: Record<string, { filename: string }[]> }).files;
      const avatarFile = files?.avatar?.[0] ?? files?.image?.[0];
      const finalAvatarUrl = avatarFile ? `/uploads/profiles/${avatarFile.filename}` : avatarUrl;

      const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;
      const updated = await UserService.update(id, {
        name,
        email,
        passwordHash,
        initials: initials ?? null,
        avatarUrl: finalAvatarUrl ?? null,
        phone: phone ?? null,
        country: country ?? null,
      });

      res.json(mapUserToProfile(updated));
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
      await UserService.remove(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getFavorites(req: Request, res: Response): Promise<void> {
    try {
      const id = getIdParam(req);
      if (!id) {
        res.status(400).json({ error: 'Invalid id' });
        return;
      }

      const favorites = await FavoriteService.getByUserWithDestination(id);
      const destinations = favorites.map(f => mapDestination(f.destination));
      res.json(destinations);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getCurrent(req: Request, res: Response): Promise<void> {
    try {
      const id = getCurrentUserId(req);
      if (!id) {
        res.status(400).json({ error: 'Missing userId' });
        return;
      }
      const user = await UserService.getById(id);
      if (!user) {
        res.status(404).json({ error: 'Profile not found' });
        return;
      }
      res.json(mapUserToProfile(user));
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async updateCurrent(req: Request, res: Response): Promise<void> {
    try {
      const id = getCurrentUserId(req);
      if (!id) {
        res.status(400).json({ error: 'Missing userId' });
        return;
      }
      const { name, email, password, initials, avatarUrl, phone, country } = req.body as {
        name?: string;
        email?: string;
        password?: string;
        initials?: string;
        avatarUrl?: string;
        phone?: string;
        country?: string;
      };
      const files = (req as Request & { files?: Record<string, { filename: string }[]> }).files;
      const avatarFile = files?.avatar?.[0] ?? files?.image?.[0];
      const finalAvatarUrl = avatarFile ? `/uploads/profiles/${avatarFile.filename}` : avatarUrl;
      const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;

      const updated = await UserService.update(id, {
        name,
        email,
        passwordHash,
        initials: initials ?? null,
        avatarUrl: finalAvatarUrl ?? null,
        phone: phone ?? null,
        country: country ?? null,
      });

      res.json(mapUserToProfile(updated));
    } catch (error) {
      const prismaError = error as { code?: string };
      if (prismaError?.code === 'P2025') {
        res.status(404).json({ error: 'Profile not found' });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
