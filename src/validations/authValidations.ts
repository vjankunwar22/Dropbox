import {z} from "zod";


export const loginSchema = z.object({
    email: z.email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  });

export const registerSchema = loginSchema.extend({
    name : z.string().min(1,"Name is required"),
    role : z.enum(["ADMIN", "USER"]).optional(),

});