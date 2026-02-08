import { prisma } from '../libs/prisma';

export class SectionService {
  static async getAll() {
    return prisma.section.findMany({ orderBy: { id: 'asc' } });
  }

  static async getById(id: number) {
    return prisma.section.findUnique({ where: { id } });
  }

  static async create(data: {
    title: string;
    titleEn: string;
    description?: string | null;
    descriptionEn?: string | null;
    imageUrl?: string | null;
    iconUrl?: string | null;
  }) {
    return prisma.section.create({
      data: {
        title: data.title,
        titleEn: data.titleEn,
        description: data.description ?? null,
        descriptionEn: data.descriptionEn ?? null,
        imageUrl: data.imageUrl ?? null,
        iconUrl: data.iconUrl ?? null,
      },
    });
  }

  static async update(
    id: number,
    data: {
      title?: string;
      titleEn?: string;
      description?: string | null;
      descriptionEn?: string | null;
      imageUrl?: string | null;
      iconUrl?: string | null;
    },
  ) {
    return prisma.section.update({
      where: { id },
      data: {
        title: data.title,
        titleEn: data.titleEn,
        description: data.description ?? undefined,
        descriptionEn: data.descriptionEn ?? undefined,
        imageUrl: data.imageUrl ?? undefined,
        iconUrl: data.iconUrl ?? undefined,
      },
    });
  }

  static async remove(id: number) {
    return prisma.section.delete({ where: { id } });
  }
}
