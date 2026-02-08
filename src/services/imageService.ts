import { prisma } from '../libs/prisma';

export class ImageService {
  static async getAll() {
    return prisma.image.findMany({ orderBy: { id: 'asc' } });
  }

  static async getById(id: number) {
    return prisma.image.findUnique({ where: { id } });
  }

  static async create(data: { businessId: number; imageUrl?: string | null }) {
    return prisma.image.create({
      data: {
        business: { connect: { id: data.businessId } },
        imageUrl: data.imageUrl ?? null,
      },
    });
  }

  static async update(id: number, data: { imageUrl?: string | null }) {
    return prisma.image.update({
      where: { id },
      data: { imageUrl: data.imageUrl ?? undefined },
    });
  }

  static async remove(id: number) {
    return prisma.image.delete({ where: { id } });
  }
}
