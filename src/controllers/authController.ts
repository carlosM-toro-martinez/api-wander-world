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
}
