import { prisma } from '../libs/prisma';

export class PaymentService {
  static async getMethods(userId?: number) {
    return prisma.paymentMethod.findMany({
      where: userId ? { userId } : undefined,
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  static async createMethod(data: {
    userId: number;
    type: string;
    brand?: string | null;
    last4?: string | null;
    holderName?: string | null;
    isDefault?: boolean;
  }) {
    return prisma.paymentMethod.create({
      data: {
        user: { connect: { id: data.userId } },
        type: data.type,
        brand: data.brand ?? null,
        last4: data.last4 ?? null,
        holderName: data.holderName ?? null,
        isDefault: data.isDefault ?? false,
      },
    });
  }

  static async deleteMethod(id: number) {
    return prisma.paymentMethod.delete({ where: { id } });
  }

  static async createIntent(data: {
    userId: number;
    bookingId?: number | null;
    amount: number;
    currency?: string;
    provider?: string | null;
  }) {
    return prisma.payment.create({
      data: {
        user: { connect: { id: data.userId } },
        bookingId: data.bookingId ?? null,
        amount: data.amount,
        currency: data.currency ?? 'BOB',
        provider: data.provider ?? 'local',
        status: 'PENDING',
      },
    });
  }

  static async confirm(id: number) {
    return prisma.$transaction(async tx => {
      const payment = await tx.payment.update({
        where: { id },
        data: { status: 'CONFIRMED' },
      });

      if (payment.bookingId) {
        await tx.booking.update({
          where: { id: payment.bookingId },
          data: { status: 'PAID' },
        });
      }

      return payment;
    });
  }

  static async getPayment(id: number) {
    return prisma.payment.findUnique({ where: { id } });
  }
}
