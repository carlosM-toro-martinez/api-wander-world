import { prisma } from '../libs/prisma';

export class SocialNetworkService {
  static async getAll() {
    return prisma.socialNetwork.findMany({ orderBy: { id: 'asc' } });
  }

  static async getById(id: number) {
    return prisma.socialNetwork.findUnique({ where: { id } });
  }

  static async create(data: {
    businessId: number;
    facebookUrl?: string | null;
    instagramUrl?: string | null;
    twitterUrl?: string | null;
    tiktokUrl?: string | null;
    whatsappNumber?: string | null;
  }) {
    return prisma.socialNetwork.create({
      data: {
        business: { connect: { id: data.businessId } },
        facebookUrl: data.facebookUrl ?? null,
        instagramUrl: data.instagramUrl ?? null,
        twitterUrl: data.twitterUrl ?? null,
        tiktokUrl: data.tiktokUrl ?? null,
        whatsappNumber: data.whatsappNumber ?? null,
      },
    });
  }

  static async update(
    id: number,
    data: {
      facebookUrl?: string | null;
      instagramUrl?: string | null;
      twitterUrl?: string | null;
      tiktokUrl?: string | null;
      whatsappNumber?: string | null;
    },
  ) {
    return prisma.socialNetwork.update({
      where: { id },
      data: {
        facebookUrl: data.facebookUrl ?? undefined,
        instagramUrl: data.instagramUrl ?? undefined,
        twitterUrl: data.twitterUrl ?? undefined,
        tiktokUrl: data.tiktokUrl ?? undefined,
        whatsappNumber: data.whatsappNumber ?? undefined,
      },
    });
  }

  static async remove(id: number) {
    return prisma.socialNetwork.delete({ where: { id } });
  }
}
