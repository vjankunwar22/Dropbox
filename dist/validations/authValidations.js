"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.email("Invalid email address"),
    password: zod_1.z.string().min(1, "Password is required"),
});
exports.registerSchema = exports.loginSchema.extend({
    name: zod_1.z.string().min(1, "Name is required"),
    role: zod_1.z.enum(["ADMIN", "USER"]).optional(),
});
