import { prisma } from '../libs/prisma';

export class CategoryService {
  static async getAll() {
    return prisma.category.findMany({
      include: { _count: { select: { destinations: true } } },
      orderBy: { id: 'asc' },
    });
  }

  static async getById(id: number) {
    return prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { destinations: true } } },
    });
  }

  static async create(data: { title: string; imageUrl?: string | null; count?: number }) {
    return prisma.category.create({
      data: {
        title: data.title,
        imageUrl: data.imageUrl ?? null,
        count: typeof data.count === 'number' ? data.count : 0,
      },
    });
  }

  static async update(id: number, data: { title?: string; imageUrl?: string | null; count?: number }) {
    return prisma.category.update({
      where: { id },
      data: {
        title: data.title,
        imageUrl: data.imageUrl ?? undefined,
        count: typeof data.count === 'number' ? data.count : undefined,
      },
    });
  }

  static async remove(id: number) {
    return prisma.category.delete({ where: { id } });
  }
}
