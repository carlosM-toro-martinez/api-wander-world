import { Request, Response } from 'express';
import { BookingService } from '../services/bookingService';
import { getIdParam } from '../utils/request';
import { mapDestination } from '../utils/destinationMapper';

type BookingRecord = NonNullable<Awaited<ReturnType<typeof BookingService.getById>>>;

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatTravelers(adults: number, children: number): string {
  const adultLabel = adults === 1 ? 'adulto' : 'adultos';
  const childLabel = children === 1 ? 'nino' : 'ninos';
  return children > 0
    ? `${adults} ${adultLabel}, ${children} ${childLabel}`
    : `${adults} ${adultLabel}`;
}

function getUserId(req: Request): number | null {
  const authUser = (req as Request & { user?: { userId?: number } }).user;
  const raw =
    authUser?.userId ??
    (req.query.userId as string | undefined) ??
    (req.params.userId as string | undefined) ??
    (req.body as { userId?: number | string }).userId;
  const userId = Number(raw);
  return Number.isNaN(userId) || userId <= 0 ? null : userId;
}

function mapBooking(record: BookingRecord) {
  return {
    id: record.id,
    bookingNumber: record.bookingNumber,
    status: record.status,
    destination: mapDestination(record.destination),
    business: record.business,
    user: record.user,
    travelDate: formatDateOnly(record.travelDate),
    travelers: formatTravelers(record.adults, record.children),
    travelersDetail: {
      adults: record.adults,
      children: record.children,
    },
    notes: record.notes,
    totalPrice: record.totalPrice,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export class BookingController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.query.userId ? Number(req.query.userId) : undefined;
      if (req.query.userId && (Number.isNaN(userId) || !userId)) {
        res.status(400).json({ error: 'Invalid userId' });
        return;
      }
      const records = await BookingService.getAll({ userId });
      res.json(records.map(mapBooking));
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = getIdParam(req);
      if (!id) {
        res.status(400).json({ error: 'Invalid id' });
        return;
      }
      const record = await BookingService.getById(id);
      if (!record) {
        res.status(404).json({ error: 'Booking not found' });
        return;
      }
      res.json(mapBooking(record));
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { destinationId, businessId, userId, travelDate, travelers, notes } =
        req.body as {
          destinationId: number | string;
          businessId: number | string;
          userId: number | string;
          travelDate: string;
          travelers?: { adults?: number | string; children?: number | string };
          notes?: string;
        };

      const parsedDestinationId = Number(destinationId);
      const parsedBusinessId = Number(businessId);
      const parsedUserId = Number(userId);
      const adults = Number(travelers?.adults ?? 1);
      const children = Number(travelers?.children ?? 0);
      const parsedTravelDate = new Date(travelDate);

      if (
        !parsedDestinationId ||
        !parsedBusinessId ||
        !parsedUserId ||
        Number.isNaN(parsedTravelDate.getTime()) ||
        !adults ||
        adults < 1 ||
        children < 0
      ) {
        res.status(400).json({ error: 'Missing or invalid required fields' });
        return;
      }

      const record = await BookingService.create({
        destinationId: parsedDestinationId,
        businessId: parsedBusinessId,
        userId: parsedUserId,
        travelDate: parsedTravelDate,
        adults,
        children,
        notes: notes ?? null,
      });

      if (!record) {
        res.status(404).json({ error: 'Destination not found' });
        return;
      }

      res.status(201).json(mapBooking(record));
    } catch (error) {
      const prismaError = error as { code?: string };
      if (prismaError?.code === 'P2025') {
        res.status(404).json({ error: 'Related record not found' });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async cancel(req: Request, res: Response): Promise<void> {
    try {
      const id = getIdParam(req);
      if (!id) {
        res.status(400).json({ error: 'Invalid id' });
        return;
      }
      const record = await BookingService.updateStatus(id, 'CANCELLED');
      res.json(mapBooking(record));
    } catch (error) {
      const prismaError = error as { code?: string };
      if (prismaError?.code === 'P2025') {
        res.status(404).json({ error: 'Booking not found' });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getMyTrips(req: Request, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      if (!userId) {
        res.status(400).json({ error: 'Missing userId' });
        return;
      }
      const records = await BookingService.getAll({ userId });
      const now = new Date();
      const trips = records.map(mapBooking);
      res.json({
        upcoming: trips.filter(
          trip =>
            ['PENDING', 'CONFIRMED', 'PAID'].includes(trip.status) &&
            new Date(trip.travelDate) >= now,
        ),
        past: trips.filter(
          trip =>
            ['CANCELLED', 'COMPLETED'].includes(trip.status) ||
            new Date(trip.travelDate) < now,
        ),
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
