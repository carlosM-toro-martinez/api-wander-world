import { Request, Response } from 'express';
import { formatDateEsShort, parseDateEsShort } from '../utils/formatters';
import { DestinationService } from '../services/destinationService';
import { mapDestination } from '../utils/destinationMapper';

function parseJsonField<T>(value: unknown, fallback: T): T {
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

function parseIdParam(req: Request): number | null {
  const idParam = (req.params as { id?: string | string[] }).id;
  const idValue = Array.isArray(idParam) ? idParam[0] : idParam;
  if (!idValue) return null;
  const id = parseInt(idValue, 10);
  return Number.isNaN(id) ? null : id;
}

function toNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isNaN(num) ? undefined : num;
}

export class DestinationController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const records = await DestinationService.getAll();
      res.json(records.map(mapDestination));
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseIdParam(req);
      if (!id) {
        res.status(400).json({ error: 'Invalid id' });
        return;
      }
      const record = await DestinationService.getById(id);
      if (!record) {
        res.status(404).json({ error: 'Destination not found' });
        return;
      }
      res.json(mapDestination(record));
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const {
        name,
        location,
        image,
        rating,
        reviews,
        price,
        categoryId,
        businessId,
        description,
        durationDays,
        groupSize,
        availability,
        includes,
        itinerary,
        reviewsDetail,
      } = req.body as {
        name: string;
        location: string;
        image: string;
        rating?: number;
        reviews?: number;
        price: number;
        categoryId: number;
        businessId: number;
        description: string;
        durationDays: number;
        groupSize: string;
        availability: string;
        includes?: string[] | string;
        itinerary?: { day: number; title: string; description: string }[] | string;
        reviewsDetail?: {
          name: string;
          rating: number;
          comment: string;
          date: string;
        }[] | string;
      };

      const uploadedImage = (req as Request & { file?: { filename: string } }).file;
      const imageUrl = uploadedImage ? `/uploads/destinations/${uploadedImage.filename}` : image;

      const parsedPrice = toNumber(price);
      const parsedCategoryId = toNumber(categoryId);
      const parsedBusinessId = toNumber(businessId);
      const parsedDurationDays = toNumber(durationDays);
      const parsedRating = toNumber(rating);
      const parsedReviewsCount = toNumber(reviews);

      if (
        !name ||
        !location ||
        !imageUrl ||
        parsedPrice === undefined ||
        parsedCategoryId === undefined ||
        parsedBusinessId === undefined ||
        !description ||
        parsedDurationDays === undefined ||
        !groupSize ||
        !availability
      ) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const parsedIncludes = parseJsonField<string[]>(includes, []);
      const parsedItinerary = parseJsonField<
        { day: number; title: string; description: string }[]
      >(itinerary, []);
      const parsedReviewsDetail = parseJsonField<
        { name: string; rating: number; comment: string; date: string }[]
      >(reviewsDetail, []);

      const reviewsToCreate = parsedReviewsDetail.map(detail => {
          const parsedDate = parseDateEsShort(detail.date);
          if (!parsedDate) {
            throw new Error(`Invalid review date: ${detail.date}`);
          }
          return {
            reviewerName: detail.name,
            rating: detail.rating,
            comment: detail.comment,
            reviewedAt: parsedDate,
          };
        });

      const reviewsCount =
        typeof parsedReviewsCount === 'number'
          ? parsedReviewsCount
          : reviewsToCreate.length;

      const record = await DestinationService.create({
        name,
        location,
        imageUrl,
        rating: typeof parsedRating === 'number' ? parsedRating : 0,
        reviewsCount,
        price: parsedPrice,
        categoryId: parsedCategoryId,
        businessId: parsedBusinessId,
        description,
        durationDays: parsedDurationDays,
        groupSize,
        availability,
        includes: parsedIncludes,
        itinerary: parsedItinerary,
        reviewsDetail: reviewsToCreate,
      });

      res.status(201).json(mapDestination(record));
    } catch (error) {
      const message =
        error instanceof Error && error.message.startsWith('Invalid review date')
          ? error.message
          : 'Internal server error';
      res.status(message.includes('Invalid review date') ? 400 : 500).json({
        error: message,
      });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseIdParam(req);
      if (!id) {
        res.status(400).json({ error: 'Invalid id' });
        return;
      }
      const data = req.body as {
        name?: string;
        location?: string;
        image?: string;
        rating?: number;
        reviews?: number;
        price?: number;
        categoryId?: number;
        businessId?: number;
        description?: string;
        durationDays?: number;
        groupSize?: string;
        availability?: string;
      };

      const parsedPrice = toNumber(data.price);
      const parsedCategoryId = toNumber(data.categoryId);
      const parsedBusinessId = toNumber(data.businessId);
      const parsedDurationDays = toNumber(data.durationDays);
      const parsedRating = toNumber(data.rating);
      const parsedReviews = toNumber(data.reviews);

      const updated = await DestinationService.update(id, {
        name: data.name,
        location: data.location,
        imageUrl: data.image,
        rating: parsedRating,
        reviewsCount: parsedReviews,
        price: parsedPrice,
        categoryId: parsedCategoryId,
        businessId: parsedBusinessId,
        description: data.description,
        durationDays: parsedDurationDays,
        groupSize: data.groupSize,
        availability: data.availability,
      });

      res.json(mapDestination(updated));
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async addReview(req: Request, res: Response): Promise<void> {
    try {
      const id = parseIdParam(req);
      if (!id) {
        res.status(400).json({ error: 'Invalid id' });
        return;
      }

      const { name, rating, comment, date } = req.body as {
        name: string;
        rating: number;
        comment: string;
        date?: string;
      };

      const parsedRating = toNumber(rating);
      if (!name || parsedRating === undefined || !comment) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const reviewedAt = date ? parseDateEsShort(date) : new Date();
      if (date && !reviewedAt) {
        res.status(400).json({ error: 'Invalid review date' });
        return;
      }

      const result = await DestinationService.addReview(id, {
        reviewerName: name,
        rating: parsedRating,
        comment,
        reviewedAt: reviewedAt ?? new Date(),
      });

      if (!result) {
        res.status(404).json({ error: 'Destination not found' });
        return;
      }

      res.status(201).json({
        id: result.review.id,
        name: result.review.reviewerName,
        rating: result.review.rating,
        comment: result.review.comment,
        date: formatDateEsShort(result.review.reviewedAt),
        destination: {
          id,
          rating: result.destinationRating,
          reviews: result.reviewsCount,
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async remove(req: Request, res: Response): Promise<void> {
    try {
      const id = parseIdParam(req);
      if (!id) {
        res.status(400).json({ error: 'Invalid id' });
        return;
      }
      await DestinationService.remove(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
