import { Router } from "express";
import {
  getAllUsers,
  getProfile,
  login,
  register,
  updateProfile,
  updateUser,
} from "../controllers/authController";
import { validateRequest } from "../middlewares/validateRequest";
import {
  loginSchema,
  registerSchema,
  userProfileSchema,
} from "../validations/authValidations";
import { authenticateJWT, isAdmin } from "../middlewares/authMiddleware";

const router = Router();

router.post("/register", validateRequest(registerSchema), register);

router.post("/login", validateRequest(loginSchema), login);

router.get("/all", authenticateJWT, isAdmin, getAllUsers);

router.get("/profile", authenticateJWT, getProfile);

router.put(
  "/updateProfile",
  authenticateJWT,
  validateRequest(userProfileSchema),
  updateProfile
);

router.put(
  "/updateuser/:id",
  authenticateJWT,
  isAdmin,
  updateUser,
  validateRequest(userProfileSchema)
);

export default router;
