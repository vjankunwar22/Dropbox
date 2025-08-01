import multer from "multer";
import { Request, Response, NextFunction } from "express";
import { HttpError } from "../types/error";

// File type validation
const allowedFileTypes = [
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "text/html",
  "text/css",
  "text/javascript",
  "application/json",
  "application/xml",

  // Images
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",

  // Archives
  "application/zip",
  "application/x-rar-compressed",
  "application/x-7z-compressed",
  "application/gzip",
  "application/tar",

  // Media
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "video/mp4",
  "video/webm",
  "video/ogg",

  // Code files
  "application/x-python-code",
  "text/x-python",
  "text/x-java-source",
  "text/x-c++src",
  "text/x-csrc",
  "text/x-php",
  "text/x-ruby",
  "text/x-go",
  "text/x-rust",
  "text/x-swift",
  "text/x-kotlin",
  "text/x-scala",
  "text/x-typescript",
  "text/x-javascript",
];

// File size limits (in bytes)
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_FILES_COUNT = 10; // Maximum files per upload

// File filter function
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Check file type
  if (!allowedFileTypes.includes(file.mimetype)) {
    return cb(
      new HttpError("BAD_REQUEST", `File type ${file.mimetype} is not allowed`)
    );
  }

  // Check file size
  if (file.size && file.size > MAX_FILE_SIZE) {
    return cb(
      new HttpError(
        "BAD_REQUEST",
        `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`
      )
    );
  }

  cb(null, true);
};

// Multer configuration for single file upload
export const uploadSingle = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter,
});

// Multer configuration for multiple file upload
export const uploadMultiple = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES_COUNT,
  },
  fileFilter,
});

// Multer configuration for profile image upload
export const uploadProfileImage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB for profile images
    files: 1,
  },
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    const allowedImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (!allowedImageTypes.includes(file.mimetype)) {
      return cb(
        new HttpError(
          "BAD_REQUEST",
          "Only image files are allowed for profile pictures"
        )
      );
    }

    cb(null, true);
  },
});

// Error handling middleware for multer
export const handleMulterError = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case "LIMIT_FILE_SIZE":
        return res.status(400).json({
          error: "File too large",
          message: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`,
        });
      case "LIMIT_FILE_COUNT":
        return res.status(400).json({
          error: "Too many files",
          message: `Maximum ${MAX_FILES_COUNT} files allowed per upload`,
        });
      case "LIMIT_UNEXPECTED_FILE":
        return res.status(400).json({
          error: "Unexpected file field",
          message: "Check your form field names",
        });
      default:
        return res.status(400).json({
          error: "File upload error",
          message: error.message,
        });
    }
  }

  if (error instanceof HttpError) {
    return res.status(400).json({
      error: error.message,
      message: error.message,
    });
  }

  next(error);
};

// Helper function to validate uploaded files
export const validateUploadedFiles = (files: Express.Multer.File[]) => {
  if (!files || files.length === 0) {
    throw new HttpError("BAD_REQUEST", "No files uploaded");
  }

  for (const file of files) {
    if (!file.originalname) {
      throw new HttpError("BAD_REQUEST", "File must have a name");
    }

    if (!file.mimetype) {
      throw new HttpError("BAD_REQUEST", "File must have a valid MIME type");
    }
  }

  return files;
};

// Helper function to generate safe file names
export const generateSafeFileName = (
  originalName: string,
  userId: string
): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split(".").pop() || "";
  const baseName = originalName
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9]/g, "_");

  return `${userId}_${timestamp}_${randomString}_${baseName}.${extension}`;
};
