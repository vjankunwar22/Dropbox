import { Router } from "express";
import { getAllUsers, login, register } from "../controllers/authController";
import { validateRequest } from "../middlewares/validateRequest";
import { loginSchema, registerSchema } from "../validations/authValidations";
import { authenticateJWT, isAdmin } from "../middlewares/authMiddleware";

const router = Router();

router.post("/register", validateRequest(registerSchema), register);

router.post("/login", validateRequest(loginSchema), login);

router.get("/all", authenticateJWT, isAdmin, getAllUsers)

export default router;