import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(1, "Name is required"),
  role: z.enum(["ADMIN", "USER"]).optional(),
});

export const userProfileSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  profileImage: z.url().optional().or(z.literal("").optional()),
  email: z.email("Invalid email address").optional(),
  password: z.string().min(1, "Password is required").optional(),
  role: z.enum(["ADMIN", "USER"]).optional(),
});
