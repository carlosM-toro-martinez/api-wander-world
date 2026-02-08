import { prisma } from '../libs/prisma';

export class OpeningHoursService {
  static async getAll() {
    return prisma.openingHours.findMany({ orderBy: { id: 'asc' } });
  }

  static async getById(id: number) {
    return prisma.openingHours.findUnique({ where: { id } });
  }

  static async create(data: {
    businessId: number;
    weekend?: string | null;
    morningHours?: string[];
    afternoonHours?: string[];
  }) {
    return prisma.openingHours.create({
      data: {
        business: { connect: { id: data.businessId } },
        weekend: data.weekend ?? null,
        morningHours: data.morningHours ?? [],
        afternoonHours: data.afternoonHours ?? [],
      },
    });
  }

  static async update(
    id: number,
    data: { weekend?: string | null; morningHours?: string[]; afternoonHours?: string[] },
  ) {
    return prisma.openingHours.update({
      where: { id },
      data: {
        weekend: data.weekend ?? undefined,
        morningHours: data.morningHours ?? undefined,
        afternoonHours: data.afternoonHours ?? undefined,
      },
    });
  }

  static async remove(id: number) {
    return prisma.openingHours.delete({ where: { id } });
  }
}
