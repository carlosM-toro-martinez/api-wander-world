import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { BusinessService } from '../services/businessService';
import { DestinationService } from '../services/destinationService';
import { getIdParam } from '../utils/request';
import { mapDestination } from '../utils/destinationMapper';

export class BusinessController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { sectionId } = req.query as { sectionId?: string };
      if (sectionId) {
        const parsedId = parseInt(sectionId, 10);
        if (Number.isNaN(parsedId)) {
          res.status(400).json({ error: 'Invalid sectionId' });
          return;
        }
        const records = await BusinessService.getBySection(parsedId);
        res.json(records);
        return;
      }
      const records = await BusinessService.getAll();
      res.json(records);
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
      const record = await BusinessService.getById(id);
      if (!record) {
        res.status(404).json({ error: 'Business not found' });
        return;
      }
      res.json(record);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const {
        name,
        description,
        descriptionEn,
        daysAttention,
        logoUrl,
        phoneNumber,
        websiteUrl,
        mail,
        address,
        isActive,
        sectionId,
        ownerFullName,
        ownerEmail,
        ownerPassword,
        subscriptionStartedAt,
        subscriptionEndsAt,
        subscriptionStatus,
        licenseNumber,
      } = req.body as {
        name: string;
        description?: string;
        descriptionEn?: string;
        daysAttention?: string;
        logoUrl?: string;
        phoneNumber?: string;
        websiteUrl?: string;
        mail?: string;
        address?: string;
        isActive?: boolean;
        sectionId?: number | string | null;
        ownerFullName?: string;
        ownerEmail?: string;
        ownerPassword?: string;
        subscriptionStartedAt?: string;
        subscriptionEndsAt?: string;
        subscriptionStatus?: 'ACTIVE' | 'PAUSED' | 'CANCELED' | 'EXPIRED';
        licenseNumber?: string;
      };
      const files = (req as Request & { files?: Record<string, { filename: string }[]> }).files;
      const logoFile = files?.logo?.[0] ?? files?.image?.[0];
      const finalLogoUrl = logoFile ? `/uploads/businesses/${logoFile.filename}` : logoUrl;

      if (!name) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const ownerPasswordHash = ownerPassword
        ? await bcrypt.hash(ownerPassword, 10)
        : null;

      const parsedSectionId =
        sectionId === undefined || sectionId === null || sectionId === ''
          ? null
          : Number(sectionId);
      if (parsedSectionId !== null && Number.isNaN(parsedSectionId)) {
        res.status(400).json({ error: 'Invalid sectionId' });
        return;
      }

      const record = await BusinessService.create({
        name,
        description: description ?? null,
        descriptionEn: descriptionEn ?? null,
        daysAttention: daysAttention ?? null,
        logoUrl: finalLogoUrl ?? null,
        phoneNumber: phoneNumber ?? null,
        websiteUrl: websiteUrl ?? null,
        mail: mail ?? null,
        address: address ?? null,
        isActive,
        sectionId: parsedSectionId,
        ownerFullName: ownerFullName ?? null,
        ownerEmail: ownerEmail ?? null,
        ownerPasswordHash,
        subscriptionStartedAt: subscriptionStartedAt ? new Date(subscriptionStartedAt) : null,
        subscriptionEndsAt: subscriptionEndsAt ? new Date(subscriptionEndsAt) : null,
        subscriptionStatus,
        licenseNumber: licenseNumber ?? null,
      });

      res.status(201).json(record);
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
      const {
        name,
        description,
        descriptionEn,
        daysAttention,
        logoUrl,
        phoneNumber,
        websiteUrl,
        mail,
        address,
        isActive,
        sectionId,
        ownerFullName,
        ownerEmail,
        ownerPassword,
        subscriptionStartedAt,
        subscriptionEndsAt,
        subscriptionStatus,
        licenseNumber,
      } = req.body as {
        name?: string;
        description?: string;
        descriptionEn?: string;
        daysAttention?: string;
        logoUrl?: string;
        phoneNumber?: string;
        websiteUrl?: string;
        mail?: string;
        address?: string;
        isActive?: boolean;
        sectionId?: number | string | null;
        ownerFullName?: string;
        ownerEmail?: string;
        ownerPassword?: string;
        subscriptionStartedAt?: string;
        subscriptionEndsAt?: string;
        subscriptionStatus?: 'ACTIVE' | 'PAUSED' | 'CANCELED' | 'EXPIRED';
        licenseNumber?: string;
      };
      const files = (req as Request & { files?: Record<string, { filename: string }[]> }).files;
      const logoFile = files?.logo?.[0] ?? files?.image?.[0];
      const finalLogoUrl = logoFile ? `/uploads/businesses/${logoFile.filename}` : logoUrl;

      const ownerPasswordHash = ownerPassword
        ? await bcrypt.hash(ownerPassword, 10)
        : undefined;

      const parsedSectionId =
        sectionId === undefined || sectionId === null || sectionId === ''
          ? null
          : Number(sectionId);
      if (parsedSectionId !== null && Number.isNaN(parsedSectionId)) {
        res.status(400).json({ error: 'Invalid sectionId' });
        return;
      }

      const record = await BusinessService.update(id, {
        name,
        description: description ?? null,
        descriptionEn: descriptionEn ?? null,
        daysAttention: daysAttention ?? null,
        logoUrl: finalLogoUrl ?? null,
        phoneNumber: phoneNumber ?? null,
        websiteUrl: websiteUrl ?? null,
        mail: mail ?? null,
        address: address ?? null,
        isActive,
        sectionId: parsedSectionId,
        ownerFullName: ownerFullName ?? null,
        ownerEmail: ownerEmail ?? null,
        ownerPasswordHash,
        subscriptionStartedAt: subscriptionStartedAt ? new Date(subscriptionStartedAt) : null,
        subscriptionEndsAt: subscriptionEndsAt ? new Date(subscriptionEndsAt) : null,
        subscriptionStatus,
        licenseNumber: licenseNumber ?? null,
      });

      res.json(record);
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
      await BusinessService.remove(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getDestinations(req: Request, res: Response): Promise<void> {
    try {
      const id = getIdParam(req);
      if (!id) {
        res.status(400).json({ error: 'Invalid id' });
        return;
      }

      const records = await DestinationService.getByBusiness(id);
      res.json(records.map(mapDestination));
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
