"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const helpers_1 = require("../lib/helpers");
const error_js_1 = require("../types/error.js");
const db_config_js_1 = __importDefault(require("../services/db.config.js"));
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
exports.register = (0, helpers_1.tryCatchHandler)(async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!email || !password) {
        throw new error_js_1.HttpError("BAD_REQUEST", "Email and password is required");
    }
    const existingUser = await db_config_js_1.default.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new error_js_1.HttpError("BAD_REQUEST", "User Already Exist");
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const user = await db_config_js_1.default.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role: role === "ADMIN" ? "ADMIN" : "USER",
        },
    });
    res.status(201).json({ message: "User Registered successfully." });
    return;
});
exports.login = (0, helpers_1.tryCatchHandler)(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new error_js_1.HttpError("BAD_REQUEST", "Email and password is required");
    }
    const user = await db_config_js_1.default.user.findUnique({ where: { email } });
    if (!user || !user.password) {
        throw new error_js_1.HttpError("UNAUTHORIZED", "User not found .");
    }
    const isMatch = await bcrypt_1.default.compare(password, user.password);
    if (!isMatch) {
        throw new error_js_1.HttpError("UNAUTHORIZED", "Invalid Credentials");
    }
    const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
        expiresIn: "1d",
    });
    res.status(200).json({ token });
    return;
});
