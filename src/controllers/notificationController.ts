import { Request, Response } from 'express';
import { formatDateEsShort } from '../utils/formatters';
import { NotificationService } from '../services/notificationService';
import { getIdParam } from '../utils/request';

type NotificationRecord = Awaited<ReturnType<typeof NotificationService.getAll>>[number];

export class NotificationController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const records = await NotificationService.getAll();
      res.json(
        records.map((record: NotificationRecord) => ({
          id: record.id,
          icon: record.icon,
          iconBg: record.iconBg,
          iconColor: record.iconColor,
          title: record.title,
          description: record.description,
          time: record.timeLabel ?? formatDateEsShort(record.sentAt),
          unread: !record.isRead,
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
      const record = await NotificationService.getById(id);
      if (!record) {
        res.status(404).json({ error: 'Notification not found' });
        return;
      }
      res.json({
        id: record.id,
        icon: record.icon,
        iconBg: record.iconBg,
        iconColor: record.iconColor,
        title: record.title,
        description: record.description,
        time: record.timeLabel ?? formatDateEsShort(record.sentAt),
        unread: !record.isRead,
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { userId, icon, iconBg, iconColor, title, description, time, unread } =
        req.body as {
          userId: number;
          icon: string;
          iconBg: string;
          iconColor: string;
          title: string;
          description: string;
          time?: string;
          unread?: boolean;
        };

      if (!userId || !icon || !iconBg || !iconColor || !title || !description) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const record = await NotificationService.create({
        userId,
        icon,
        iconBg,
        iconColor,
        title,
        description,
        timeLabel: time ?? null,
        isRead: typeof unread === 'boolean' ? !unread : false,
      });

      res.status(201).json({
        id: record.id,
        icon: record.icon,
        iconBg: record.iconBg,
        iconColor: record.iconColor,
        title: record.title,
        description: record.description,
        time: record.timeLabel ?? formatDateEsShort(record.sentAt),
        unread: !record.isRead,
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
      const { title, description, time, unread } = req.body as {
        title?: string;
        description?: string;
        time?: string;
        unread?: boolean;
      };

      const record = await NotificationService.update(id, {
        title,
        description,
        timeLabel: time ?? null,
        isRead: typeof unread === 'boolean' ? !unread : undefined,
      });

      res.json({
        id: record.id,
        icon: record.icon,
        iconBg: record.iconBg,
        iconColor: record.iconColor,
        title: record.title,
        description: record.description,
        time: record.timeLabel ?? formatDateEsShort(record.sentAt),
        unread: !record.isRead,
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const id = getIdParam(req);
      if (!id) {
        res.status(400).json({ error: 'Invalid id' });
        return;
      }
      const record = await NotificationService.markAsRead(id);
      res.json({
        id: record.id,
        icon: record.icon,
        iconBg: record.iconBg,
        iconColor: record.iconColor,
        title: record.title,
        description: record.description,
        time: record.timeLabel ?? formatDateEsShort(record.sentAt),
        unread: !record.isRead,
      });
    } catch (error) {
      const prismaError = error as { code?: string };
      if (prismaError?.code === 'P2025') {
        res.status(404).json({ error: 'Notification not found' });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const rawUserId =
        (req.query.userId as string | undefined) ??
        (req.body as { userId?: string | number }).userId;
      const userId = rawUserId ? Number(rawUserId) : undefined;
      if (rawUserId && (!userId || Number.isNaN(userId))) {
        res.status(400).json({ error: 'Invalid userId' });
        return;
      }
      const result = await NotificationService.markAllAsRead(userId);
      res.json({ updated: result.count });
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
      await NotificationService.remove(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
