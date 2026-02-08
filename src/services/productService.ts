import { prisma } from '../libs/prisma';

export class ProductService {
  static async getAll() {
    return prisma.product.findMany({ orderBy: { id: 'asc' } });
  }

  static async getById(id: number) {
    return prisma.product.findUnique({ where: { id } });
  }

  static async create(data: {
    businessId: number;
    productDetails?: string | null;
    productDetailsEn?: string | null;
    price?: string | null;
  }) {
    return prisma.product.create({
      data: {
        business: { connect: { id: data.businessId } },
        productDetails: data.productDetails ?? null,
        productDetailsEn: data.productDetailsEn ?? null,
        price: data.price ?? null,
      },
    });
  }

  static async update(
    id: number,
    data: { productDetails?: string | null; productDetailsEn?: string | null; price?: string | null },
  ) {
    return prisma.product.update({
      where: { id },
      data: {
        productDetails: data.productDetails ?? undefined,
        productDetailsEn: data.productDetailsEn ?? undefined,
        price: data.price ?? undefined,
      },
    });
  }

  static async remove(id: number) {
    return prisma.product.delete({ where: { id } });
  }
}
