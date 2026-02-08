import { prisma } from '../libs/prisma';
import type { Prisma } from '@prisma/client';

export type DestinationCreateInput = {
  name: string;
  location: string;
  imageUrl: string;
  rating?: number;
  reviewsCount?: number;
  price: number;
  categoryId: number;
  businessId: number;
  description: string;
  durationDays: number;
  groupSize: string;
  availability: string;
  includes?: string[];
  itinerary?: { day: number; title: string; description: string }[];
  reviewsDetail?: {
    reviewerName: string;
    rating: number;
    comment: string;
    reviewedAt: Date;
  }[];
};

export class DestinationService {
  static async getAll() {
    return prisma.destination.findMany({
      include: {
        category: true,
        business: { select: { id: true, name: true, logoUrl: true } },
        includes: { orderBy: { sortOrder: 'asc' } },
        itinerary: { orderBy: { day: 'asc' } },
        reviewsDetail: { orderBy: { reviewedAt: 'desc' } },
      },
      orderBy: { id: 'asc' },
    });
  }

  static async getByBusiness(businessId: number) {
    return prisma.destination.findMany({
      where: { businessId },
      include: {
        category: true,
        business: { select: { id: true, name: true, logoUrl: true } },
        includes: { orderBy: { sortOrder: 'asc' } },
        itinerary: { orderBy: { day: 'asc' } },
        reviewsDetail: { orderBy: { reviewedAt: 'desc' } },
      },
      orderBy: { id: 'asc' },
    });
  }

  static async getById(id: number) {
    return prisma.destination.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, title: true } },
        business: { select: { id: true, name: true, logoUrl: true } },
        includes: { orderBy: { sortOrder: 'asc' } },
        itinerary: { orderBy: { day: 'asc' } },
        reviewsDetail: { orderBy: { reviewedAt: 'desc' } },
      },
    });
  }

  static async create(input: DestinationCreateInput) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      return tx.destination.create({
        data: {
          name: input.name,
          location: input.location,
          imageUrl: input.imageUrl,
          rating: typeof input.rating === 'number' ? input.rating : 0,
          reviewsCount: typeof input.reviewsCount === 'number' ? input.reviewsCount : 0,
          price: input.price,
          description: input.description,
          durationDays: input.durationDays,
          groupSize: input.groupSize,
          availability: input.availability,
          category: { connect: { id: input.categoryId } },
          business: { connect: { id: input.businessId } },
          includes:
            input.includes && input.includes.length
              ? {
                  create: input.includes.map((item, index) => ({
                    item,
                    sortOrder: index,
                  })),
                }
              : undefined,
          itinerary:
            input.itinerary && input.itinerary.length
              ? {
                  create: input.itinerary.map(item => ({
                    day: item.day,
                    title: item.title,
                    description: item.description,
                  })),
                }
              : undefined,
          reviewsDetail:
            input.reviewsDetail && input.reviewsDetail.length
              ? { create: input.reviewsDetail }
              : undefined,
        },
        include: {
          category: true,
          business: { select: { id: true, name: true, logoUrl: true } },
          includes: { orderBy: { sortOrder: 'asc' } },
          itinerary: { orderBy: { day: 'asc' } },
          reviewsDetail: { orderBy: { reviewedAt: 'desc' } },
        },
      });
    });
  }

  static async update(id: number, data: Partial<DestinationCreateInput>) {
    return prisma.destination.update({
      where: { id },
      data: {
        name: data.name,
        location: data.location,
        imageUrl: data.imageUrl,
        rating: data.rating,
        reviewsCount: data.reviewsCount,
        price: data.price,
        description: data.description,
        durationDays: data.durationDays,
        groupSize: data.groupSize,
        availability: data.availability,
        category: data.categoryId ? { connect: { id: data.categoryId } } : undefined,
        business: data.businessId ? { connect: { id: data.businessId } } : undefined,
      },
      include: {
        category: true,
        business: { select: { id: true, name: true, logoUrl: true } },
        includes: { orderBy: { sortOrder: 'asc' } },
        itinerary: { orderBy: { day: 'asc' } },
        reviewsDetail: { orderBy: { reviewedAt: 'desc' } },
      },
    });
  }

  static async addReview(
    destinationId: number,
    review: {
      reviewerName: string;
      rating: number;
      comment: string;
      reviewedAt: Date;
    },
  ) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const destination = await tx.destination.findUnique({
        where: { id: destinationId },
        select: { id: true, rating: true, reviewsCount: true },
      });

      if (!destination) {
        return null;
      }

      const createdReview = await tx.destinationReview.create({
        data: {
          destination: { connect: { id: destinationId } },
          reviewerName: review.reviewerName,
          rating: review.rating,
          comment: review.comment,
          reviewedAt: review.reviewedAt,
        },
      });

      const nextReviewsCount = destination.reviewsCount + 1;
      const nextRating =
        nextReviewsCount > 0
          ? (destination.rating * destination.reviewsCount + review.rating) /
            nextReviewsCount
          : review.rating;

      await tx.destination.update({
        where: { id: destinationId },
        data: { reviewsCount: nextReviewsCount, rating: nextRating },
      });

      return {
        review: createdReview,
        destinationRating: nextRating,
        reviewsCount: nextReviewsCount,
      };
    });
  }

  static async remove(id: number) {
    return prisma.destination.delete({ where: { id } });
  }
}
