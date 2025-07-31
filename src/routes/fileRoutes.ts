import { Router } from "express";
import { authenticateJWT, isAdmin } from "../middlewares/authMiddleware";
import {
  createFile,
  deleteFile,
  getAllFiles,
  getFileContent,
  getWorkspaceFiles,
  shareFile,
  updateFile,
} from "../controllers/fileController";
import { validateRequest } from "../middlewares/validateRequest";
import { fileSchema } from "../validations/fileValidations";
import { isWorkspaceAdmin } from "../middlewares/workSpaceMiddleware";
import multer from "multer";
import { getPresignedGetUrl, putObject } from "../services/storage";

const upload = multer({ storage: multer.memoryStorage() });

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

router.get(
  "/:fileId/content",
  authenticateJWT,
  isWorkspaceAdmin,
  getFileContent
);

router.patch("/:fileId", authenticateJWT, updateFile);

router.put("/:fileId/shares", authenticateJWT, shareFile);


router.post("/upload", upload.single("file"), async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ error: "Missing file (use 'file')." });
  
      const ts = new Date().toISOString().replace(/[:.]/g, "-");
      const safeName = req.file.originalname.replace(/\s+/g, "_");
      const key = `${ts}-${safeName}`;
  
      await putObject({
        key,
        buffer: req.file.buffer,
        contentType: req.file.mimetype,
      });
  
      const url = await getPresignedGetUrl(key, 300); // 5 min
      res.status(201).json({ key, url });
    } catch (err) {
      next(err);
    }
  });
  
  router.get("/:key", async (req, res, next) => {
    try {
      const url = await getPresignedGetUrl(req.params.key, 300);
      res.json({ key: req.params.key, url });
    } catch (err) {
      next(err);
    }
  });


export default router;
