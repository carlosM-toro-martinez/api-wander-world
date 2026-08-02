import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserService } from '../services/userService';
import { mapUserToProfile } from '../utils/profileMapper';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, initials } = req.body as {
        name: string;
        email: string;
        password: string;
        initials?: string;
      };

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
      });

      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: '7d',
      });

      res.status(201).json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          initials: user.initials ?? '',
        },
      });
    } catch (error) {
      const prismaError = error as { code?: string };
      if (prismaError?.code === 'P2002') {
        res.status(409).json({ error: 'Email already exists' });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body as {
        email: string;
        password: string;
      };

      if (!email || !password) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const user = await UserService.getByEmailWithDetails(email);
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: '7d',
      });

      res.json({
        token,
        user: mapUserToProfile(user),
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async logout(_req: Request, res: Response): Promise<void> {
    res.json({ success: true });
  }

  static async me(req: Request, res: Response): Promise<void> {
    try {
      const authUser = (req as Request & { user?: { userId?: number } }).user;
      const rawUserId = authUser?.userId ?? (req.query.userId as string | undefined);
      const userId = Number(rawUserId);
      if (!userId || Number.isNaN(userId)) {
        res.status(400).json({ error: 'Missing userId' });
        return;
      }

      const user = await UserService.getById(userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({ user: mapUserToProfile(user) });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async refresh(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const bodyToken = (req.body as { token?: string }).token;
      const token = authHeader?.startsWith('Bearer ')
        ? authHeader.slice('Bearer '.length)
        : bodyToken;

      if (!token) {
        res.status(400).json({ error: 'Missing token' });
        return;
      }

      const payload = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true }) as {
        userId: number;
        email: string;
      };
      const nextToken = jwt.sign(
        { userId: payload.userId, email: payload.email },
        JWT_SECRET,
        { expiresIn: '7d' },
      );

      res.json({ token: nextToken });
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  }

  static async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body as { email?: string };
    if (!email) {
      res.status(400).json({ error: 'Missing email' });
      return;
    }
    res.json({ success: true });
  }

  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body as { email?: string; password?: string };
      if (!email || !password) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const user = await UserService.getByEmail(email);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      await UserService.update(user.id, { passwordHash });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
