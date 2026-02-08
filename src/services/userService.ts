import { prisma } from '../libs/prisma';

export class UserService {
  static async getAll() {
    return prisma.user.findMany({
      include: {
        stats: true,
        favorites: { select: { destinationId: true } },
        trips: { select: { id: true, date: true, status: true, country: true } },
      },
      orderBy: { id: 'asc' },
    });
  }

  static async getById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        stats: true,
        favorites: { select: { destinationId: true } },
        trips: { select: { id: true, date: true, status: true, country: true } },
      },
    });
  }

  static async getByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  static async getByEmailWithDetails(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        stats: true,
        favorites: { select: { destinationId: true } },
        trips: { select: { id: true, date: true, status: true, country: true } },
      },
    });
  }

  static async create(data: {
    name: string;
    email: string;
    passwordHash: string;
    initials?: string | null;
    avatarUrl?: string | null;
    stats?: { trips: number; countries: number; favorites: number };
    favoriteDestinationIds?: number[];
  }) {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        initials: data.initials ?? null,
        avatarUrl: data.avatarUrl ?? null,
        stats: data.stats
          ? {
              create: {
                trips: data.stats.trips,
                countries: data.stats.countries,
                favorites: data.stats.favorites,
              },
            }
          : undefined,
        favorites:
          data.favoriteDestinationIds && data.favoriteDestinationIds.length
            ? {
                createMany: {
                  data: data.favoriteDestinationIds.map(destinationId => ({
                    destinationId,
                  })),
                },
              }
            : undefined,
      },
      include: {
        stats: true,
        favorites: { select: { destinationId: true } },
        trips: { select: { id: true, date: true, status: true, country: true } },
      },
    });
  }

  static async update(
    id: number,
    data: {
      name?: string;
      email?: string;
      passwordHash?: string;
      initials?: string | null;
      avatarUrl?: string | null;
    },
  ) {
    return prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        initials: data.initials ?? undefined,
        avatarUrl: data.avatarUrl ?? undefined,
      },
    });
  }

  static async remove(id: number) {
    return prisma.user.delete({ where: { id } });
  }
}
