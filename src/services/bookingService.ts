import { prisma } from '../libs/prisma';
import type { BookingStatus, Prisma } from '../../generated/prisma';

const bookingInclude = {
  destination: {
    include: {
      category: { select: { id: true, title: true } },
      business: { select: { id: true, name: true, logoUrl: true } },
      includes: { orderBy: { sortOrder: 'asc' } },
      itinerary: { orderBy: { day: 'asc' } },
      reviewsDetail: { orderBy: { reviewedAt: 'desc' } },
    },
  },
  business: { include: { section: true } },
  user: { select: { id: true, name: true, email: true, initials: true } },
} satisfies Prisma.BookingInclude;

export class BookingService {
  static async getAll(filters?: { userId?: number }) {
    return prisma.booking.findMany({
      where: filters?.userId ? { userId: filters.userId } : undefined,
      include: bookingInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getById(id: number) {
    return prisma.booking.findUnique({
      where: { id },
      include: bookingInclude,
    });
  }

  static async create(data: {
    userId: number;
    destinationId: number;
    businessId: number;
    travelDate: Date;
    adults: number;
    children: number;
    notes?: string | null;
  }) {
    return prisma.$transaction(async tx => {
      const destination = await tx.destination.findUnique({
        where: { id: data.destinationId },
        select: { price: true },
      });

      if (!destination) {
        return null;
      }

      const travelerCount = data.adults + data.children;
      const totalPrice = destination.price * travelerCount;
      const year = data.travelDate.getFullYear();

      const created = await tx.booking.create({
        data: {
          bookingNumber: `KW-${year}-${Date.now()}`,
          user: { connect: { id: data.userId } },
          destination: { connect: { id: data.destinationId } },
          business: { connect: { id: data.businessId } },
          travelDate: data.travelDate,
          adults: data.adults,
          children: data.children,
          notes: data.notes ?? null,
          totalPrice,
        },
      });

      return tx.booking.update({
        where: { id: created.id },
        data: { bookingNumber: `KW-${year}-${String(created.id).padStart(5, '0')}` },
        include: bookingInclude,
      });
    });
  }

  static async updateStatus(id: number, status: BookingStatus) {
    return prisma.booking.update({
      where: { id },
      data: { status },
      include: bookingInclude,
    });
  }
}
