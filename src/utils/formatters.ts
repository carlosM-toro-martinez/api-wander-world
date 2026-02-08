const MONTHS_ES_SHORT = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

export function formatDateEsShort(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = MONTHS_ES_SHORT[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export function parseDateEsShort(value: string): Date | null {
  const parts = value.trim().split(/\s+/);
  if (parts.length !== 3) return null;
  const [dayRaw, monthRaw, yearRaw] = parts;
  const day = Number(dayRaw);
  const year = Number(yearRaw);
  const monthIndex = MONTHS_ES_SHORT.findIndex(
    m => m.toLowerCase() === monthRaw.toLowerCase(),
  );
  if (!day || !year || monthIndex < 0) return null;
  return new Date(year, monthIndex, day);
}

export function mapTripStatusToLabel(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'Pendiente';
    case 'CONFIRMED':
      return 'Confirmado';
    case 'COMPLETED':
      return 'Completado';
    case 'CANCELED':
      return 'Cancelado';
    default:
      return status;
  }
}

export function mapTripStatusFromInput(status: string): 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELED' | null {
  const normalized = status.trim().toLowerCase();
  switch (normalized) {
    case 'pending':
    case 'pendiente':
      return 'PENDING';
    case 'confirmed':
    case 'confirmado':
      return 'CONFIRMED';
    case 'completed':
    case 'completado':
      return 'COMPLETED';
    case 'canceled':
    case 'cancelado':
    case 'cancelled':
      return 'CANCELED';
    default:
      return null;
  }
}
