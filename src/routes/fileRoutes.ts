import { Router, Request, Response, NextFunction } from "express";
import { authenticateJWT, isAdmin } from "../middlewares/authMiddleware";
import {
  createFile,
  deleteFile,
  getAllFiles,
  getFileContent,
  getWorkspaceFiles,
  shareFile,
  updateFile,
  uploadFile,
  uploadMultipleFiles,
} from "../controllers/fileController";
import { validateRequest } from "../middlewares/validateRequest";
import { fileSchema } from "../validations/fileValidations";
import { isWorkspaceAdmin } from "../middlewares/workSpaceMiddleware";
import {
  uploadSingle,
  uploadMultiple,
  handleMulterError,
} from "../middlewares/uploadMiddleware";
import { getPresignedGetUrl, putObject } from "../services/storage";

const router = Router();

router.post(
  "/create",
  authenticateJWT,
  validateRequest(fileSchema),
  createFile
);

router.get(
  "/:workspaceId/files",
  authenticateJWT,
  isWorkspaceAdmin,
  getWorkspaceFiles
);

router.delete("/:id", authenticateJWT, deleteFile);

router.get("/allFiles", authenticateJWT, isAdmin, getAllFiles);

router.get("/:fileId/content", authenticateJWT, getFileContent);

router.patch("/:fileId", authenticateJWT, updateFile);

router.put("/:fileId/shares", authenticateJWT, shareFile);

// File upload routes with proper multer integration
router.post(
  "/upload-single",
  authenticateJWT,
  uploadSingle.single("file"),
  handleMulterError,
  uploadFile
);

router.post(
  "/upload-multiple",
  authenticateJWT,
  uploadMultiple.array("files", 10),
  handleMulterError,
  uploadMultipleFiles
);

export default router;
