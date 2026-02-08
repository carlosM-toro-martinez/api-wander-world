import { prisma } from '../libs/prisma';

export class TripService {
  static async getAll() {
    return prisma.trip.findMany({ orderBy: { id: 'asc' } });
  }

  static async getById(id: number) {
    return prisma.trip.findUnique({ where: { id } });
  }

  static async create(data: {
    userId: number;
    destinationId: number;
    name: string;
    country: string;
    imageUrl: string;
    date: Date;
    travelers: string;
    status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELED';
    bookingNumber: string;
  }) {
    return prisma.trip.create({
      data: {
        user: { connect: { id: data.userId } },
        destination: { connect: { id: data.destinationId } },
        name: data.name,
        country: data.country,
        imageUrl: data.imageUrl,
        date: data.date,
        travelers: data.travelers,
        status: data.status,
        bookingNumber: data.bookingNumber,
      },
    });
  }

  static async update(
    id: number,
    data: {
      name?: string;
      country?: string;
      imageUrl?: string;
      date?: Date;
      travelers?: string;
      status?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELED';
      bookingNumber?: string;
    },
  ) {
    return prisma.trip.update({
      where: { id },
      data: {
        name: data.name,
        country: data.country,
        imageUrl: data.imageUrl,
        date: data.date,
        travelers: data.travelers,
        status: data.status,
        bookingNumber: data.bookingNumber,
      },
    });
  }

  static async remove(id: number) {
    return prisma.trip.delete({ where: { id } });
  }
}
