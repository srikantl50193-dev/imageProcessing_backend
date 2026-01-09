import multer from 'multer';
import { Request } from 'express';

// Memory storage for processing
const storage = multer.memoryStorage();

// File filter to allow only images
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
  }

  if (file.size > maxSize) {
    return cb(new Error('File too large. Maximum size is 5MB.'));
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1 // Only one file at a time
  }
});