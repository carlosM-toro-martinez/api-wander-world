import { prisma } from '../libs/prisma';

type StructuredOpeningHours = {
  closedDays?: string[];
  morningHours: string[];
  afternoonHours: string[];
};

const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function rangeContainsTime(range: string | undefined, minutes: number): boolean {
  if (!range) return false;
  const [start, end] = range.split('-');
  if (!start || !end) return false;
  const [startHour, startMinute] = start.split(':').map(Number);
  const [endHour, endMinute] = end.split(':').map(Number);
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  return minutes >= startMinutes && minutes <= endMinutes;
}

function isBusinessOpenNow(business: {
  openingHours?: { weekend: string | null; morningHours: string[]; afternoonHours: string[] }[];
}) {
  const schedule = business.openingHours?.[0];
  if (!schedule) return false;

  const now = new Date();
  const dayIndex = now.getDay();
  const currentDay = dayKeys[dayIndex];
  const closedDays = (schedule.weekend ?? '')
    .split(',')
    .map(day => day.trim().toLowerCase())
    .filter(Boolean);

  if (closedDays.includes(currentDay)) return false;

  const minutes = now.getHours() * 60 + now.getMinutes();
  return (
    rangeContainsTime(schedule.morningHours[dayIndex], minutes) ||
    rangeContainsTime(schedule.afternoonHours[dayIndex], minutes)
  );
}

async function saveOpeningHours(businessId: number, openingHours: StructuredOpeningHours) {
  const current = await prisma.openingHours.findFirst({ where: { businessId } });
  const data = {
    weekend: openingHours.closedDays?.join(',') ?? null,
    morningHours: openingHours.morningHours,
    afternoonHours: openingHours.afternoonHours,
  };

  if (current) {
    await prisma.openingHours.update({ where: { id: current.id }, data });
    return;
  }

  await prisma.openingHours.create({
    data: {
      business: { connect: { id: businessId } },
      ...data,
    },
  });
}

export class BusinessService {
  static async getAll(filters?: { includeInactive?: boolean; openNow?: boolean }) {
    const records = await prisma.business.findMany({
      where: filters?.includeInactive ? undefined : { isActive: true },
      include: { section: true, openingHours: true },
      orderBy: { id: 'asc' },
    });

    if (filters?.openNow === undefined) {
      return records;
    }

    return records.filter(record => isBusinessOpenNow(record) === filters.openNow);
  }

  static async getReviewApplications(status?: 'PENDING' | 'APPROVED' | 'REJECTED') {
    const where =
      status === 'APPROVED'
        ? { isActive: true }
        : status === 'REJECTED'
          ? { isActive: false, subscriptionStatus: 'PAUSED' as const }
          : status === 'PENDING'
            ? { isActive: false, NOT: { subscriptionStatus: 'PAUSED' as const } }
            : undefined;

    return prisma.business.findMany({
      where,
      include: { section: true, openingHours: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getReviewApplicationById(id: number) {
    return prisma.business.findUnique({
      where: { id },
      include: { section: true, openingHours: true },
    });
  }

  static async getById(id: number) {
    return prisma.business.findUnique({
      where: { id },
      include: {
        section: true,
        openingHours: true,
        destinations: {
          include: {
            category: true,
            business: { select: { id: true, name: true, logoUrl: true } },
            includes: { orderBy: { sortOrder: 'asc' } },
            itinerary: { orderBy: { day: 'asc' } },
            reviewsDetail: { orderBy: { reviewedAt: 'desc' } },
          },
          orderBy: { id: 'asc' },
        },
      },
    });
  }

  static async getByOwnerEmail(ownerEmail: string) {
    return prisma.business.findFirst({
      where: { ownerEmail },
      include: {
        section: true,
        openingHours: true,
        destinations: {
          include: {
            category: true,
            business: { select: { id: true, name: true, logoUrl: true } },
            includes: { orderBy: { sortOrder: 'asc' } },
            itinerary: { orderBy: { day: 'asc' } },
            reviewsDetail: { orderBy: { reviewedAt: 'desc' } },
          },
          orderBy: { id: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getBySection(
    sectionId: number,
    filters?: { includeInactive?: boolean; openNow?: boolean },
  ) {
    const records = await prisma.business.findMany({
      where: { sectionId, ...(filters?.includeInactive ? {} : { isActive: true }) },
      include: { section: true, openingHours: true },
      orderBy: { id: 'asc' },
    });

    if (filters?.openNow === undefined) {
      return records;
    }

    return records.filter(record => isBusinessOpenNow(record) === filters.openNow);
  }

  static async approve(id: number) {
    return prisma.business.update({
      where: { id },
      data: { isActive: true },
      include: { section: true, openingHours: true },
    });
  }

  static async reject(id: number) {
    return prisma.business.update({
      where: { id },
      data: { isActive: false, subscriptionStatus: 'PAUSED' },
      include: { section: true, openingHours: true },
    });
  }

  static async create(data: {
    name: string;
    description?: string | null;
    descriptionEn?: string | null;
    daysAttention?: string | null;
    logoUrl?: string | null;
    phoneNumber?: string | null;
    websiteUrl?: string | null;
    mail?: string | null;
    address?: string | null;
    isActive?: boolean;
    sectionId?: number | null;
    ownerFullName?: string | null;
    ownerEmail?: string | null;
    ownerPasswordHash?: string | null;
    subscriptionStartedAt?: Date | null;
    subscriptionEndsAt?: Date | null;
    subscriptionStatus?: 'ACTIVE' | 'PAUSED' | 'CANCELED' | 'EXPIRED';
    licenseNumber?: string | null;
    openingHours?: StructuredOpeningHours;
  }) {
    const now = new Date();
    
    // Usar SQL RAW para insertar, ya que Prisma no maneja bien el tipo 'point'
    await prisma.$executeRaw`
      INSERT INTO "Business" (
        name, description, description_en, days_attention, 
        logo_url, phone_number, website_url, mail, address, 
        coordinates, state, section_id, 
        owner_full_name, owner_email, owner_password_hash,
        subscription_started_at, subscription_ends_at, subscription_status,
        license_number, created_at, updated_at
      ) VALUES (
        ${data.name},
        ${data.description || null},
        ${data.descriptionEn || null},
        ${data.daysAttention || null},
        ${data.logoUrl || null},
        ${data.phoneNumber || null},
        ${data.websiteUrl || null},
        ${data.mail || null},
        ${data.address || null},
        POINT(0, 0),  -- Valor por defecto para coordinates (punto en 0,0)
        ${data.isActive !== undefined ? (String(data.isActive) === 'true') : false},
        ${data.sectionId || null},
        ${data.ownerFullName || null},
        ${data.ownerEmail || null},
        ${data.ownerPasswordHash || null},
        ${data.subscriptionStartedAt || null},
        ${data.subscriptionEndsAt || null},
        ${data.subscriptionStatus || 'ACTIVE'},
        ${(data.licenseNumber && data.licenseNumber.trim() !== "") ? data.licenseNumber.trim() : null},
        ${now},
        ${now}
      )
    `;

    // Recuperar el negocio recién creado
    const newBusiness = await prisma.business.findFirst({
      where: { 
        name: data.name,
        createdAt: now 
      },
      include: { section: true, openingHours: true },
      orderBy: { id: 'desc' },
    });

    if (newBusiness && data.openingHours) {
      await saveOpeningHours(newBusiness.id, data.openingHours);
      return prisma.business.findUnique({
        where: { id: newBusiness.id },
        include: { section: true, openingHours: true },
      });
    }

    return newBusiness;
  }

  static async update(
    id: number,
    data: Partial<{
      name: string;
      description?: string | null;
      descriptionEn?: string | null;
      daysAttention?: string | null;
      logoUrl?: string | null;
      phoneNumber?: string | null;
      websiteUrl?: string | null;
      mail?: string | null;
      address?: string | null;
      isActive?: boolean;
      sectionId?: number | null;
      ownerFullName?: string | null;
      ownerEmail?: string | null;
      ownerPasswordHash?: string | null;
      subscriptionStartedAt?: Date | null;
      subscriptionEndsAt?: Date | null;
      subscriptionStatus?: 'ACTIVE' | 'PAUSED' | 'CANCELED' | 'EXPIRED';
      licenseNumber?: string | null;
      openingHours?: StructuredOpeningHours;
    }>,
  ) {
    await prisma.business.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description ?? undefined,
        descriptionEn: data.descriptionEn ?? undefined,
        daysAttention: data.daysAttention ?? undefined,
        logoUrl: data.logoUrl ?? undefined,
        phoneNumber: data.phoneNumber ?? undefined,
        websiteUrl: data.websiteUrl ?? undefined,
        mail: data.mail ?? undefined,
        address: data.address ?? undefined,
        isActive: data.isActive !== undefined ? (String(data.isActive) === 'true') : undefined,
        section: data.sectionId ? { connect: { id: data.sectionId } } : undefined,
        ownerFullName: data.ownerFullName ?? undefined,
        ownerEmail: data.ownerEmail ?? undefined,
        ownerPasswordHash: data.ownerPasswordHash ?? undefined,
        subscriptionStartedAt: data.subscriptionStartedAt ?? undefined,
        subscriptionEndsAt: data.subscriptionEndsAt ?? undefined,
        subscriptionStatus: data.subscriptionStatus ?? undefined,
        licenseNumber: data.licenseNumber ?? undefined,
      },
    });

    if (data.openingHours) {
      await saveOpeningHours(id, data.openingHours);
    }

    return prisma.business.findUnique({
      where: { id },
      include: { section: true, openingHours: true },
    });
  }

  static async remove(id: number) {
    return prisma.business.delete({ where: { id } });
  }
}
