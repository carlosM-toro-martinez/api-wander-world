import { prisma } from '../libs/prisma';

export class AdminService {
  static async getAll() {
    return prisma.establishmentAdmin.findMany({ orderBy: { id: 'asc' } });
  }

  static async getById(id: number) {
    return prisma.establishmentAdmin.findUnique({ where: { id } });
  }

  static async create(data: { username: string; passwordHash: string; businessId?: number | null }) {
    return prisma.establishmentAdmin.create({
      data: {
        username: data.username,
        password: data.passwordHash,
        business: data.businessId ? { connect: { id: data.businessId } } : undefined,
      },
    });
  }

  static async update(
    id: number,
    data: { username?: string; passwordHash?: string; businessId?: number | null },
  ) {
    return prisma.establishmentAdmin.update({
      where: { id },
      data: {
        username: data.username,
        password: data.passwordHash,
        business: data.businessId ? { connect: { id: data.businessId } } : undefined,
      },
    });
  }

  static async remove(id: number) {
    return prisma.establishmentAdmin.delete({ where: { id } });
  }
}
