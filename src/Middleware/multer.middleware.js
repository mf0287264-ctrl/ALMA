import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import multer from 'multer';
import { fileTypeFromFile } from 'file-type';
import { BadRequestException } from '../Common/Utils/Errors/exceptions.error.js';

const mimeForExtension = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
const roots = ['uploads', 'uploaded'].map(folder => path.resolve(folder));
const contained = filename => roots.some(root => filename.startsWith(`${root}${path.sep}`));
export function removeUploadedFile(file) {
  if (!file?.path) return;
  const target = path.resolve(file.path);
  if (contained(target)) { try { fs.unlinkSync(target); } catch {} }
}

export async function verifyFileSignature(file) {
  if (!file?.path) return;
  try {
    if (!contained(path.resolve(file.path))) throw new Error('Invalid upload destination.');
    const type = await fileTypeFromFile(file.path);
    const expected = mimeForExtension[path.extname(file.originalname || '').toLowerCase()];
    if (!type || !expected || file.mimetype !== expected || type.mime !== expected) throw new Error('Signature mismatch.');
    file.detectedSignature = type;
    file.path = file.path.replace(/\\/g, '/');
    return type;
  } catch {
    removeUploadedFile(file);
    throw new BadRequestException('Upload a genuine JPG, PNG, or WebP image with a matching file extension and content type.', null, 'INVALID_FILE_SIGNATURE');
  }
}

export const multerUpload = ({ desiredPath = 'Profiles', folderName = 'uploads' } = {}) => {
  const root = path.resolve(folderName);
  const destination = path.resolve(root, desiredPath);
  if (!roots.includes(root) || !destination.startsWith(`${root}${path.sep}`)) throw new Error('Invalid upload destination.');
  fs.mkdirSync(destination, { recursive: true });
  const upload = multer({
    storage: multer.diskStorage({ destination, filename(req, file, cb) { cb(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`); } }),
    fileFilter(req, file, cb) {
      const expected = mimeForExtension[path.extname(file.originalname || '').toLowerCase()];
      if (expected && expected === file.mimetype) cb(null, true);
      else cb(new BadRequestException('Upload a JPG, PNG, or WebP image with a matching content type.'), false);
    },
    limits: { fileSize: 4 * 1024 * 1024, files: 1, fields: 5, parts: 6, fieldSize: 4096, fieldNameSize: 100 },
  });
  upload.single = (fieldName = 'profile') => {
    const fields = [...new Set([fieldName, 'profile', 'profile_image', 'file', 'avatar'])].map(name => ({ name, maxCount: 1 }));
    return (req, res, next) => upload.fields(fields)(req, res, async error => {
      const files = Object.values(req.files || {}).flat();
      if (error || files.length !== 1) {
        files.forEach(removeUploadedFile);
        return next(new BadRequestException('Upload exactly one image of at most 4 MB.', null, error?.code || 'MISSED_FILE'));
      }
      req.file = files[0];
      try { await verifyFileSignature(req.file); next(); } catch (failure) { next(failure); }
    });
  };
  return upload;
};
export default multerUpload;
