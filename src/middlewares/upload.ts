import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { Request } from 'express';

const uploadsRoot = path.join(__dirname, '../../uploads');

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

ensureDir(uploadsRoot);

type DestinationCallback = (error: Error | null, destination: string) => void;
type FilenameCallback = (error: Error | null, filename: string) => void;

function createStorage(folder: string) {
  const folderPath = path.join(uploadsRoot, folder);
  ensureDir(folderPath);

  return multer.diskStorage({
    destination: (_req: Request, _file: { originalname: string }, cb: DestinationCallback) => {
      cb(null, folderPath);
    },
    filename: (_req: Request, file: { originalname: string }, cb: FilenameCallback) => {
      const timestamp = Date.now();
      const safeName = file.originalname.replace(/\s+/g, '-');
      cb(null, `${timestamp}-${safeName}`);
    },
  });
}

export function createImageUpload(folder: string, fieldName = 'image') {
  return multer({ storage: createStorage(folder) }).single(fieldName);
}

export function createImageFieldsUpload(folder: string, fieldNames: string[]) {
  const fields = fieldNames.map(name => ({ name, maxCount: 1 }));
  return multer({ storage: createStorage(folder) }).fields(fields);
}

export const uploadDestinationImage = createImageUpload('destinations', 'image');
