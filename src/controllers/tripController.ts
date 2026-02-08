import { Request, Response } from 'express';
import { TripService } from '../services/tripService';
import {
  formatDateEsShort,
  mapTripStatusFromInput,
  mapTripStatusToLabel,
  parseDateEsShort,
} from '../utils/formatters';
import { getIdParam } from '../utils/request';

type TripRecord = Awaited<ReturnType<typeof TripService.getAll>>[number];

export class TripController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const records = await TripService.getAll();
      res.json(
        records.map((record: TripRecord) => ({
          id: record.id,
          name: record.name,
          country: record.country,
          image: record.imageUrl,
          date: formatDateEsShort(record.date),
          travelers: record.travelers,
          status: mapTripStatusToLabel(record.status),
          bookingNumber: record.bookingNumber,
          destinationId: record.destinationId,
        })),
      );
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
      const record = await TripService.getById(id);
      if (!record) {
        res.status(404).json({ error: 'Trip not found' });
        return;
      }
      res.json({
        id: record.id,
        name: record.name,
        country: record.country,
        image: record.imageUrl,
        date: formatDateEsShort(record.date),
        travelers: record.travelers,
        status: mapTripStatusToLabel(record.status),
        bookingNumber: record.bookingNumber,
        destinationId: record.destinationId,
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const {
        userId,
        destinationId,
        name,
        country,
        image,
        date,
        travelers,
        status,
        bookingNumber,
      } = req.body as {
        userId: number;
        destinationId: number;
        name: string;
        country: string;
        image: string;
        date: string;
        travelers: string;
        status: string;
        bookingNumber: string;
      };
      const uploadedImage = (req as Request & { file?: { filename: string } }).file;
      const finalImage = uploadedImage ? `/uploads/trips/${uploadedImage.filename}` : image;

      if (
        !userId ||
        !destinationId ||
        !name ||
        !country ||
        !finalImage ||
        !date ||
        !travelers ||
        !status ||
        !bookingNumber
      ) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const parsedDate = parseDateEsShort(date);
      const finalDate = parsedDate ?? new Date(date);
      if (Number.isNaN(finalDate.getTime())) {
        res.status(400).json({ error: 'Invalid date format' });
        return;
      }

      const mappedStatus = mapTripStatusFromInput(status);
      if (!mappedStatus) {
        res.status(400).json({ error: 'Invalid trip status' });
        return;
      }

      const record = await TripService.create({
        userId,
        destinationId,
        name,
        country,
        imageUrl: finalImage,
        date: finalDate,
        travelers,
        status: mappedStatus,
        bookingNumber,
      });

      res.status(201).json({
        id: record.id,
        name: record.name,
        country: record.country,
        image: record.imageUrl,
        date: formatDateEsShort(record.date),
        travelers: record.travelers,
        status: mapTripStatusToLabel(record.status),
        bookingNumber: record.bookingNumber,
        destinationId: record.destinationId,
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = getIdParam(req);
      if (!id) {
        res.status(400).json({ error: 'Invalid id' });
        return;
      }
      const { name, country, image, date, travelers, status, bookingNumber } = req.body as {
        name?: string;
        country?: string;
        image?: string;
        date?: string;
        travelers?: string;
        status?: string;
        bookingNumber?: string;
      };
      const uploadedImage = (req as Request & { file?: { filename: string } }).file;
      const finalImage = uploadedImage ? `/uploads/trips/${uploadedImage.filename}` : image;

      const parsedDate = date ? parseDateEsShort(date) ?? new Date(date) : undefined;
      if (parsedDate && Number.isNaN(parsedDate.getTime())) {
        res.status(400).json({ error: 'Invalid date format' });
        return;
      }

      const mappedStatus = status ? mapTripStatusFromInput(status) : undefined;
      if (status && !mappedStatus) {
        res.status(400).json({ error: 'Invalid trip status' });
        return;
      }

      const record = await TripService.update(id, {
        name,
        country,
        imageUrl: finalImage,
        date: parsedDate,
        travelers,
        status: mappedStatus ?? undefined,
        bookingNumber,
      });

      res.json({
        id: record.id,
        name: record.name,
        country: record.country,
        image: record.imageUrl,
        date: formatDateEsShort(record.date),
        travelers: record.travelers,
        status: mapTripStatusToLabel(record.status),
        bookingNumber: record.bookingNumber,
        destinationId: record.destinationId,
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async remove(req: Request, res: Response): Promise<void> {
    try {
      const id = getIdParam(req);
      if (!id) {
        res.status(400).json({ error: 'Invalid id' });
        return;
      }
      await TripService.remove(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
