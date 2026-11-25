import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import multer from 'multer';
import { fileTypeFromFile } from 'file-type';
import { allowedExtension } from '../Common/constants.js';
import { BadRequestException } from '../Common/Utils/Errors/exceptions.error.js';

  // Verify file magic number / binary signature using file-type
export const verifyFileSignature = async (file) => {
  if (!file || !file.path) return;

  try {
    const type = await fileTypeFromFile(file.path);
    const allowedExts = ['jpg', 'jpeg', 'png', 'webp'];
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!type || !allowedExts.includes(type.ext.toLowerCase()) || !allowedMimes.includes(type.mime.toLowerCase())) {
      // Discard invalid / malicious file immediately
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new BadRequestException(
        'Invalid file signature (magic number mismatch). The file content does not match a genuine JPG, JPEG, PNG, or WebP image.',
        null,
        'INVALID_FILE_SIGNATURE'
      );
    }

    // Attach detected file signature metadata and normalize path slashes
    file.detectedSignature = type;
    file.path = file.path.replace(/\\/g, '/');
    return type;
  } catch (err) {
    if (fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch (_) {}
    }
    if (err instanceof BadRequestException) {
      throw err;
    }
    throw new BadRequestException(
      `Failed to verify file magic number signature: ${err.message}`,
      null,
      'SIGNATURE_VERIFICATION_FAILED'
    );
  }
};

export const multerUpload = ({ desiredPath = 'Profiles', folderName = 'uploads' } = {}) => {
  // Validate if the destination is exists
  const fullDestinationPath = `${folderName}/${desiredPath}`;
  if (!fs.existsSync(fullDestinationPath)) {
    fs.mkdirSync(fullDestinationPath, { recursive: true });
  }

  // Storage Section [ disk storage ]
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, fullDestinationPath);
    },
    filename: (req, file, cb) => {
      // Use crypto to generate a unique random ID to prevent any name conflict
      const uniqueSuffix = crypto.randomUUID();
      const ext = path.extname(file.originalname).toLowerCase() ||
        (file.mimetype.includes('png') ? '.png' : (file.mimetype.includes('jpeg') ? '.jpeg' : '.jpg'));
      cb(null, `${uniqueSuffix}${ext}`);
    }
  });

  const fileFilter = (req, file, cb) => {
    // Mimetype check: extract [ fileType, inputFileExtension ]
    const rawMime = (file?.mimetype || req?.mimetype || '').toLowerCase();
    const [fileType, inputFileExtension] = rawMime.split(';')[0].trim().split('/');
    const fileExt = path.extname(file?.originalname || '').toLowerCase().replace('.', '');
    console.log({ allowedExtension, fileType, inputFileExtension, fileExt });

    const fileExtensions = allowedExtension[fileType] || []; // e.g. ['jpg', 'jpeg', 'png', 'webp', 'pjpeg', 'x-png']

    const isAllowedExt =
      fileExtensions.includes(inputFileExtension) ||
      fileExtensions.includes(fileExt) ||
      ['jpg', 'jpeg', 'png', 'webp'].includes(fileExt);

    console.log({
      fileExtensions,
      cond: isAllowedExt
    });

    if (isAllowedExt) {
      cb(null, true);
    } else {
      cb(new BadRequestException("Invalid file extnesion"), false);
    }
  };

  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 10 * 1024 * 1024 // 10 MB maximum
    }
  });

  const originalSingle = upload.single.bind(upload);
  upload.single = (fieldName = 'profile') => {
    // Gracefully accept fieldName, as well as common fallbacks ('profile', 'profile_image', 'file', 'avatar')
    const uploadFields = upload.fields([
      { name: fieldName, maxCount: 1 },
      { name: 'profile', maxCount: 1 },
      { name: 'profile_image', maxCount: 1 },
      { name: 'file', maxCount: 1 },
      { name: 'avatar', maxCount: 1 }
    ]);

    return (req, res, next) => {
      uploadFields(req, res, async (err) => {
        if (err) {
          if (err instanceof multer.MulterError) {
            return next(new BadRequestException(`Upload error: ${err.message}`, err, err.code));
          }
          return next(err);
        }

        const resolvedFile =
          (req.files && req.files[fieldName]?.[0]) ||
          (req.files && req.files['profile']?.[0]) ||
          (req.files && req.files['profile_image']?.[0]) ||
          (req.files && req.files['file']?.[0]) ||
          (req.files && req.files['avatar']?.[0]) ||
          req.file;

        if (resolvedFile) {
          req.file = resolvedFile;
          try {
            await verifyFileSignature(req.file);
          } catch (signatureErr) {
            return next(signatureErr);
          }
        }

        next();
      });
    };
  };

  return upload;
};

export default multerUpload;
