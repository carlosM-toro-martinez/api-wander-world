import { prisma } from '../libs/prisma';

export class FavoriteService {
  static async getAll() {
    return prisma.favoriteDestination.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getByUser(userId: number) {
    return prisma.favoriteDestination.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getByUserWithDestination(userId: number) {
    return prisma.favoriteDestination.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        destination: {
          include: {
            category: true,
            business: { select: { id: true, name: true, logoUrl: true } },
            includes: { orderBy: { sortOrder: 'asc' } },
            itinerary: { orderBy: { day: 'asc' } },
            reviewsDetail: { orderBy: { reviewedAt: 'desc' } },
          },
        },
      },
    });
  }

  static async create(data: { userId: number; destinationId: number }) {
    return prisma.favoriteDestination.create({
      data: {
        user: { connect: { id: data.userId } },
        destination: { connect: { id: data.destinationId } },
      },
    });
  }

  static async remove(data: { userId: number; destinationId: number }) {
    return prisma.favoriteDestination.delete({
      where: { userId_destinationId: data },
    });
  }
}
