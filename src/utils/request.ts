import { Request } from 'express';

export function getIdParam(req: Request): number | null {
  const idParam = (req.params as { id?: string | string[] }).id;
  const idValue = Array.isArray(idParam) ? idParam[0] : idParam;
  if (!idValue) return null;
  const id = parseInt(idValue, 10);
  return Number.isNaN(id) ? null : id;
}
