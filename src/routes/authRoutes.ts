import { Router } from "express";
import {
  deleteUser,
  getAllUsers,
  getProfile,
  login,
  register,
  updateProfile,
  updateUser,
} from "../controllers/authController";
import { validateRequest } from "../middlewares/validateRequest";
import {
  deleteUserSchema,
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

router.delete(
  "/user/:id",
  authenticateJWT,
  isAdmin,
  deleteUser,
  validateRequest(deleteUserSchema)
);

export default router;
