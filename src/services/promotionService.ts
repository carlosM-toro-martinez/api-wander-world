import { prisma } from '../libs/prisma';

export class PromotionService {
  static async getAll() {
    return prisma.promotion.findMany({ orderBy: { id: 'asc' } });
  }

  static async getById(id: number) {
    return prisma.promotion.findUnique({ where: { id } });
  }

  static async create(data: {
    businessId: number;
    promotionDetails?: string | null;
    promotionDetailsEn?: string | null;
    price?: string | null;
  }) {
    return prisma.promotion.create({
      data: {
        business: { connect: { id: data.businessId } },
        promotionDetails: data.promotionDetails ?? null,
        promotionDetailsEn: data.promotionDetailsEn ?? null,
        price: data.price ?? null,
      },
    });
  }

  static async update(
    id: number,
    data: { promotionDetails?: string | null; promotionDetailsEn?: string | null; price?: string | null },
  ) {
    return prisma.promotion.update({
      where: { id },
      data: {
        promotionDetails: data.promotionDetails ?? undefined,
        promotionDetailsEn: data.promotionDetailsEn ?? undefined,
        price: data.price ?? undefined,
      },
    });
  }

  static async remove(id: number) {
    return prisma.promotion.delete({ where: { id } });
  }
}
