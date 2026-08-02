import { prisma } from '../libs/prisma';

export class NotificationService {
  static async getAll() {
    return prisma.notification.findMany({ orderBy: { sentAt: 'desc' } });
  }

  static async getById(id: number) {
    return prisma.notification.findUnique({ where: { id } });
  }

  static async create(data: {
    userId: number;
    icon: string;
    iconBg: string;
    iconColor: string;
    title: string;
    description: string;
    timeLabel?: string | null;
    isRead?: boolean;
  }) {
    return prisma.notification.create({
      data: {
        user: { connect: { id: data.userId } },
        icon: data.icon,
        iconBg: data.iconBg,
        iconColor: data.iconColor,
        title: data.title,
        description: data.description,
        timeLabel: data.timeLabel ?? null,
        isRead: data.isRead ?? false,
      },
    });
  }

  static async update(
    id: number,
    data: { title?: string; description?: string; timeLabel?: string | null; isRead?: boolean },
  ) {
    return prisma.notification.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        timeLabel: data.timeLabel ?? undefined,
        isRead: data.isRead,
      },
    });
  }

  static async markAsRead(id: number) {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  static async markAllAsRead(userId?: number) {
    return prisma.notification.updateMany({
      where: userId ? { userId } : undefined,
      data: { isRead: true },
    });
  }

  static async remove(id: number) {
    return prisma.notification.delete({ where: { id } });
  }
}
