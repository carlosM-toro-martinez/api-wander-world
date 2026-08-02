import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { BusinessService } from '../services/businessService';
import { DestinationService } from '../services/destinationService';
import { getIdParam } from '../utils/request';
import { mapDestination } from '../utils/destinationMapper';

type AuthenticatedRequest = Request & {
  user?: { userId?: number; email?: string };
};

type OwnedBusinessRecord = NonNullable<Awaited<ReturnType<typeof BusinessService.getByOwnerEmail>>>;
type ApprovedBusinessLookup =
  | { business: OwnedBusinessRecord }
  | { error: string; status: 401 | 403 | 404 };

type StructuredOpeningHours = {
  closedDays?: string[];
  morningHours: string[];
  afternoonHours: string[];
};

const emptyWeekHours = ['', '', '', '', '', '', ''];
const timeRangePattern = /^([01]\d|2[0-3]):[0-5]\d-([01]\d|2[0-3]):[0-5]\d$/;

function getAuthUser(req: Request): { userId: number; email: string } | null {
  const user = (req as AuthenticatedRequest).user;
  if (!user?.userId || !user.email) {
    return null;
  }

  return { userId: user.userId, email: user.email };
}

function toBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  return String(value).toLowerCase() === 'true';
}

function toNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isNaN(num) ? undefined : num;
}

function isValidTimeRange(value: string): boolean {
  if (!value) return true;
  if (!timeRangePattern.test(value)) return false;

  const [start, end] = value.split('-');
  const [startHour, startMinute] = start.split(':').map(Number);
  const [endHour, endMinute] = end.split(':').map(Number);
  return startHour * 60 + startMinute < endHour * 60 + endMinute;
}

function normalizeHourArray(value: unknown): string[] {
  const parsed = parseJsonField<string[]>(value, emptyWeekHours);
  const hours = Array.isArray(parsed) ? parsed : emptyWeekHours;
  return emptyWeekHours.map((_, index) => String(hours[index] ?? '').trim());
}

function parseOpeningHours(
  value: unknown,
  required: boolean,
): StructuredOpeningHours | null | undefined {
  const parsed = parseJsonField<{
    closedDays?: string[];
    morningHours?: string[];
    afternoonHours?: string[];
  } | null>(value, null);

  if (!parsed) {
    return required ? null : undefined;
  }

  const morningHours = normalizeHourArray(parsed.morningHours);
  const afternoonHours = normalizeHourArray(parsed.afternoonHours);
  const allRanges = [...morningHours, ...afternoonHours];
  const hasAtLeastOneRange = allRanges.some(Boolean);

  if (!hasAtLeastOneRange || allRanges.some(range => !isValidTimeRange(range))) {
    return null;
  }

  return {
    closedDays: Array.isArray(parsed.closedDays)
      ? parsed.closedDays.map(day => String(day).trim().toLowerCase()).filter(Boolean)
      : [],
    morningHours,
    afternoonHours,
  };
}

function parseJsonField<T>(value: unknown, fallback: T): T {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

function getUploadedFileUrl(req: Request, folder: 'businesses' | 'destinations') {
  const singleFile = (req as Request & { file?: { filename: string } }).file;
  if (singleFile) {
    return `/uploads/${folder}/${singleFile.filename}`;
  }

  const files = (req as Request & { files?: Record<string, { filename: string }[]> }).files;
  const file = files?.logo?.[0] ?? files?.image?.[0];
  return file ? `/uploads/${folder}/${file.filename}` : null;
}

function mapBusinessWithApproval<T extends { isActive: boolean; subscriptionStatus?: string }>(
  business: T,
) {
  return {
    ...business,
    approvalStatus: business.isActive
      ? 'APPROVED'
      : business.subscriptionStatus === 'PAUSED'
        ? 'REJECTED'
        : 'PENDING',
  };
}

function openingHoursFromBusiness(
  business: { openingHours?: { weekend: string | null; morningHours: string[]; afternoonHours: string[] }[] },
): StructuredOpeningHours | undefined {
  const opening = business.openingHours?.[0];
  if (!opening) return undefined;

  return {
    closedDays: (opening.weekend ?? '')
      .split(',')
      .map(day => day.trim().toLowerCase())
      .filter(Boolean),
    morningHours: opening.morningHours,
    afternoonHours: opening.afternoonHours,
  };
}

export class BusinessController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { sectionId, includeInactive } = req.query as {
        sectionId?: string;
        includeInactive?: string;
        openNow?: string;
      };
      const shouldIncludeInactive = includeInactive === 'true';
      const openNow = toBoolean((req.query as { openNow?: string }).openNow);
      if (sectionId) {
        const parsedId = parseInt(sectionId, 10);
        if (Number.isNaN(parsedId)) {
          res.status(400).json({ error: 'Invalid sectionId' });
          return;
        }
        const records = await BusinessService.getBySection(parsedId, {
          includeInactive: shouldIncludeInactive,
          openNow,
        });
        res.json(records);
        return;
      }
      const records = await BusinessService.getAll({
        includeInactive: shouldIncludeInactive,
        openNow,
      });
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
      const { destinations, ...business } = record;
      res.json({
        business,
        destinations: destinations.map(mapDestination),
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getMine(req: Request, res: Response): Promise<void> {
    try {
      const authUser = getAuthUser(req);
      if (!authUser) {
        res.status(401).json({ error: 'Missing authenticated user' });
        return;
      }

      const record = await BusinessService.getByOwnerEmail(authUser.email);
      if (!record) {
        res.status(404).json({ error: 'Business application not found' });
        return;
      }

      const { destinations, ...business } = record;
      res.json({
        business: mapBusinessWithApproval(business),
        services: destinations.map(mapDestination),
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async apply(req: Request, res: Response): Promise<void> {
    try {
      const authUser = getAuthUser(req);
      if (!authUser) {
        res.status(401).json({ error: 'Missing authenticated user' });
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
        sectionId,
        ownerFullName,
        legalRepresentative,
        licenseNumber,
        nit,
        openingHours,
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
        sectionId?: number | string | null;
        ownerFullName?: string;
        legalRepresentative?: string;
        licenseNumber?: string;
        nit?: string;
        openingHours?: unknown;
      };

      const existing = await BusinessService.getByOwnerEmail(authUser.email);
      if (existing) {
        res.status(409).json({ error: 'This user already has a business application' });
        return;
      }

      const parsedSectionId =
        sectionId === undefined || sectionId === null || sectionId === ''
          ? null
          : Number(sectionId);
      if (parsedSectionId !== null && Number.isNaN(parsedSectionId)) {
        res.status(400).json({ error: 'Invalid sectionId' });
        return;
      }
      if (parsedSectionId === null) {
        res.status(400).json({ error: 'Business section is required' });
        return;
      }

      const finalLogoUrl = getUploadedFileUrl(req, 'businesses') ?? logoUrl ?? null;
      const finalLicenseNumber = licenseNumber ?? nit;
      const finalOwnerName = ownerFullName ?? legalRepresentative;
      const finalOpeningHours = parseOpeningHours(openingHours, true);

      if (!name || !finalLicenseNumber || !finalOwnerName || !phoneNumber || !address) {
        res.status(400).json({ error: 'Missing legal business application fields' });
        return;
      }
      if (!finalOpeningHours) {
        res.status(400).json({ error: 'Business opening hours must use valid HH:mm-HH:mm ranges' });
        return;
      }

      const record = await BusinessService.create({
        name,
        description: description ?? null,
        descriptionEn: descriptionEn ?? null,
        daysAttention: daysAttention ?? 'Horarios estructurados',
        logoUrl: finalLogoUrl,
        phoneNumber,
        websiteUrl: websiteUrl ?? null,
        mail: mail ?? authUser.email,
        address,
        isActive: false,
        sectionId: parsedSectionId,
        ownerFullName: finalOwnerName,
        ownerEmail: authUser.email,
        ownerPasswordHash: null,
        subscriptionStartedAt: null,
        subscriptionEndsAt: null,
        subscriptionStatus: 'ACTIVE',
        licenseNumber: finalLicenseNumber,
        openingHours: finalOpeningHours,
      });

      res.status(201).json({
        business: record ? mapBusinessWithApproval(record) : record,
        message: 'Business application submitted for review',
      });
    } catch (error) {
      const prismaError = error as { code?: string };
      if (prismaError?.code === 'P2002') {
        res.status(409).json({ error: 'NIT or license number already registered' });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async updateMyApplication(req: Request, res: Response): Promise<void> {
    try {
      const authUser = getAuthUser(req);
      if (!authUser) {
        res.status(401).json({ error: 'Missing authenticated user' });
        return;
      }

      const existing = await BusinessService.getByOwnerEmail(authUser.email);
      if (!existing) {
        res.status(404).json({ error: 'Business application not found' });
        return;
      }
      if (existing.isActive) {
        res.status(409).json({ error: 'Approved businesses must be edited from the business admin panel' });
        return;
      }
      if (existing.subscriptionStatus !== 'PAUSED') {
        res.status(409).json({ error: 'Only rejected applications can be edited by the owner' });
        return;
      }

      const {
        name,
        description,
        logoUrl,
        phoneNumber,
        websiteUrl,
        mail,
        address,
        sectionId,
        ownerFullName,
        legalRepresentative,
        licenseNumber,
        nit,
        openingHours,
      } = req.body as {
        name?: string;
        description?: string;
        logoUrl?: string;
        phoneNumber?: string;
        websiteUrl?: string;
        mail?: string;
        address?: string;
        sectionId?: number | string | null;
        ownerFullName?: string;
        legalRepresentative?: string;
        licenseNumber?: string;
        nit?: string;
        openingHours?: unknown;
      };

      const parsedSectionId =
        sectionId === undefined || sectionId === null || sectionId === ''
          ? undefined
          : Number(sectionId);
      if (parsedSectionId !== undefined && Number.isNaN(parsedSectionId)) {
        res.status(400).json({ error: 'Invalid sectionId' });
        return;
      }
      const finalSectionId = parsedSectionId ?? existing.sectionId;
      if (!finalSectionId) {
        res.status(400).json({ error: 'Business section is required' });
        return;
      }

      const parsedOpeningHours =
        parseOpeningHours(openingHours, false) ?? openingHoursFromBusiness(existing);
      if (openingHours !== undefined && !parsedOpeningHours) {
        res.status(400).json({ error: 'Business opening hours must use valid HH:mm-HH:mm ranges' });
        return;
      }

      const record = await BusinessService.update(existing.id, {
        name: name ?? existing.name,
        description: description ?? existing.description,
        logoUrl: getUploadedFileUrl(req, 'businesses') ?? logoUrl ?? existing.logoUrl,
        phoneNumber: phoneNumber ?? existing.phoneNumber,
        websiteUrl: websiteUrl ?? existing.websiteUrl,
        mail: mail ?? existing.mail,
        address: address ?? existing.address,
        isActive: false,
        sectionId: finalSectionId,
        ownerFullName: ownerFullName ?? legalRepresentative ?? existing.ownerFullName,
        ownerEmail: authUser.email,
        subscriptionStatus: 'ACTIVE',
        licenseNumber: licenseNumber ?? nit ?? existing.licenseNumber,
        openingHours: parsedOpeningHours,
      });

      res.json({
        business: record ? mapBusinessWithApproval(record) : record,
        message: 'Business application updated and submitted for review',
      });
    } catch (error) {
      const prismaError = error as { code?: string };
      if (prismaError?.code === 'P2002') {
        res.status(409).json({ error: 'NIT or license number already registered' });
        return;
      }
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
        openingHours,
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
        openingHours?: unknown;
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
      const parsedOpeningHours = parseOpeningHours(openingHours, false);
      if (openingHours !== undefined && !parsedOpeningHours) {
        res.status(400).json({ error: 'Business opening hours must use valid HH:mm-HH:mm ranges' });
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
        openingHours: parsedOpeningHours ?? undefined,
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

  static async approve(req: Request, res: Response): Promise<void> {
    try {
      const id = getIdParam(req);
      if (!id) {
        res.status(400).json({ error: 'Invalid id' });
        return;
      }

      const current = await BusinessService.getReviewApplicationById(id);
      if (!current) {
        res.status(404).json({ error: 'Business not found' });
        return;
      }
      if (!current.sectionId) {
        res.status(400).json({ error: 'Business section is required before approval' });
        return;
      }

      const record = await BusinessService.approve(id);
      res.json(mapBusinessWithApproval(record));
    } catch (error) {
      const prismaError = error as { code?: string };
      if (prismaError?.code === 'P2025') {
        res.status(404).json({ error: 'Business not found' });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getReviewApplications(req: Request, res: Response): Promise<void> {
    try {
      const status = (req.query.status as string | undefined)?.toUpperCase();
      if (status && !['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
        res.status(400).json({ error: 'Invalid status' });
        return;
      }

      const records = await BusinessService.getReviewApplications(
        status as 'PENDING' | 'APPROVED' | 'REJECTED' | undefined,
      );
      res.json(records.map(mapBusinessWithApproval));
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getReviewApplicationById(req: Request, res: Response): Promise<void> {
    try {
      const id = getIdParam(req);
      if (!id) {
        res.status(400).json({ error: 'Invalid id' });
        return;
      }

      const record = await BusinessService.getReviewApplicationById(id);
      if (!record) {
        res.status(404).json({ error: 'Business application not found' });
        return;
      }

      res.json(mapBusinessWithApproval(record));
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async updateReviewApplication(req: Request, res: Response): Promise<void> {
    return BusinessController.update(req, res);
  }

  static async reject(req: Request, res: Response): Promise<void> {
    try {
      const id = getIdParam(req);
      if (!id) {
        res.status(400).json({ error: 'Invalid id' });
        return;
      }

      const record = await BusinessService.reject(id);
      res.json(mapBusinessWithApproval(record));
    } catch (error) {
      const prismaError = error as { code?: string };
      if (prismaError?.code === 'P2025') {
        res.status(404).json({ error: 'Business not found' });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private static async getApprovedBusinessForRequest(
    req: Request,
  ): Promise<ApprovedBusinessLookup> {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return { error: 'Missing authenticated user' as const, status: 401 as const };
    }

    const business = await BusinessService.getByOwnerEmail(authUser.email);
    if (!business) {
      return { error: 'Business application not found' as const, status: 404 as const };
    }
    if (!business.isActive) {
      return { error: 'Business application is still pending approval' as const, status: 403 as const };
    }

    return { business };
  }

  static async getMyServices(req: Request, res: Response): Promise<void> {
    try {
      const result = await BusinessController.getApprovedBusinessForRequest(req);
      if ('error' in result) {
        res.status(result.status).json({ error: result.error });
        return;
      }

      const services = await DestinationService.getByBusiness(result.business.id);
      res.json(services.map(mapDestination));
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async createMyService(req: Request, res: Response): Promise<void> {
    try {
      const result = await BusinessController.getApprovedBusinessForRequest(req);
      if ('error' in result) {
        res.status(result.status).json({ error: result.error });
        return;
      }

      const {
        name,
        location,
        image,
        price,
        categoryId,
        description,
        durationDays,
        groupSize,
        availability,
        includes,
        itinerary,
      } = req.body as Record<string, unknown>;

      const imageUrl = getUploadedFileUrl(req, 'destinations') ?? (image as string | undefined);
      const parsedPrice = toNumber(price);
      const parsedCategoryId = toNumber(categoryId);
      const parsedDurationDays = toNumber(durationDays);

      if (
        !name ||
        !location ||
        !imageUrl ||
        parsedPrice === undefined ||
        parsedCategoryId === undefined ||
        !description ||
        parsedDurationDays === undefined ||
        !groupSize ||
        !availability
      ) {
        res.status(400).json({ error: 'Missing required service fields' });
        return;
      }

      const record = await DestinationService.create({
        name: String(name),
        location: String(location),
        imageUrl,
        price: parsedPrice,
        categoryId: parsedCategoryId,
        businessId: result.business.id,
        description: String(description),
        durationDays: parsedDurationDays,
        groupSize: String(groupSize),
        availability: String(availability),
        includes: parseJsonField<string[]>(includes, []),
        itinerary: parseJsonField<{ day: number; title: string; description: string }[]>(
          itinerary,
          [],
        ),
      });

      res.status(201).json(mapDestination(record));
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async updateMyService(req: Request, res: Response): Promise<void> {
    try {
      const result = await BusinessController.getApprovedBusinessForRequest(req);
      if ('error' in result) {
        res.status(result.status).json({ error: result.error });
        return;
      }

      const serviceId = Number(req.params.serviceId);
      if (!serviceId || Number.isNaN(serviceId)) {
        res.status(400).json({ error: 'Invalid serviceId' });
        return;
      }

      const current = await DestinationService.getById(serviceId);
      if (!current || current.business.id !== result.business.id) {
        res.status(404).json({ error: 'Service not found for this business' });
        return;
      }

      const imageUrl =
        getUploadedFileUrl(req, 'destinations') ??
        ((req.body as { image?: string }).image || undefined);

      const updated = await DestinationService.update(serviceId, {
        name: (req.body as { name?: string }).name,
        location: (req.body as { location?: string }).location,
        imageUrl,
        price: toNumber((req.body as { price?: unknown }).price),
        categoryId: toNumber((req.body as { categoryId?: unknown }).categoryId),
        businessId: result.business.id,
        description: (req.body as { description?: string }).description,
        durationDays: toNumber((req.body as { durationDays?: unknown }).durationDays),
        groupSize: (req.body as { groupSize?: string }).groupSize,
        availability: (req.body as { availability?: string }).availability,
      });

      res.json(mapDestination(updated));
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async deleteMyService(req: Request, res: Response): Promise<void> {
    try {
      const result = await BusinessController.getApprovedBusinessForRequest(req);
      if ('error' in result) {
        res.status(result.status).json({ error: result.error });
        return;
      }

      const serviceId = Number(req.params.serviceId);
      if (!serviceId || Number.isNaN(serviceId)) {
        res.status(400).json({ error: 'Invalid serviceId' });
        return;
      }

      const current = await DestinationService.getById(serviceId);
      if (!current || current.business.id !== result.business.id) {
        res.status(404).json({ error: 'Service not found for this business' });
        return;
      }

      await DestinationService.remove(serviceId);
      res.status(204).send();
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
