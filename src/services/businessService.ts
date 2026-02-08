import { prisma } from '../libs/prisma';

export class BusinessService {
  static async getAll() {
    return prisma.business.findMany({
      include: { section: true },
      orderBy: { id: 'asc' },
    });
  }

  static async getById(id: number) {
    return prisma.business.findUnique({
      where: { id },
      include: { section: true },
    });
  }

  static async getBySection(sectionId: number) {
    return prisma.business.findMany({
      where: { sectionId },
      include: { section: true },
      orderBy: { id: 'asc' },
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
  }) {
    const now = new Date();
    
    // Usar SQL RAW para insertar, ya que Prisma no maneja bien el tipo 'point'
    const result = await prisma.$executeRaw`
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
        ${data.isActive !== undefined ? data.isActive : false},
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
      orderBy: { id: 'desc' }
    });

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
    }>,
  ) {
    return prisma.business.update({
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
        isActive: data.isActive,
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
  }

  static async remove(id: number) {
    return prisma.business.delete({ where: { id } });
  }
}
