import { Router } from "express";
import { authenticateJWT, isAdmin } from "../middlewares/authMiddleware";
import { searchFiles } from "../controllers/fileController";

const router = Router();

router.get("/files", authenticateJWT, searchFiles);

export default router;
