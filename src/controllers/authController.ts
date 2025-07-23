import bcrypt from "bcrypt";
import type { Request, Response } from "express";

import jwt from "jsonwebtoken";
import { tryCatchHandler } from "../lib/helpers";
import { HttpError } from "../types/error";
import prisma from "../services/db.config";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export const register = tryCatchHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, role } = req.body;

    if (!email || !password) {
      throw new HttpError("BAD_REQUEST", "Email and password is required");
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      throw new HttpError("BAD_REQUEST", "User Already Exist");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role === "ADMIN" ? "ADMIN" : "USER",
      },
    });

    res.status(201).json({ message: "User Registered successfully." });
    return;
  }
);

export const login = tryCatchHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new HttpError("BAD_REQUEST", "Email and password is required");
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      throw new HttpError("UNAUTHORIZED", "User not found .");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new HttpError("UNAUTHORIZED", "Invalid Credentials");
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(200).json({ token });
    return;
  }
);

export const getAllUsers = tryCatchHandler(
  async (req: Request, res: Response) => {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        role: true,
        createdAt: true,
      },
    });
    res.status(200).json(users);
    return;
  }
);

export const updateUser = tryCatchHandler(
  async (req: Request, res: Response): Promise<void> => {
    //@ts-ignore
    const { name, email, password, role, profileImage } = req.body;
    const { uuid } = req.params;
    const data: any = { name, email, profileImage, role };
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }
    const user = await prisma.user.update({
      where: { id: uuid },
      data,
    });
    res.status(200).json({ message: "User updated successfully.", user });
    return;
  }
);

export const updateProfile = tryCatchHandler(
  async (req: Request, res: Response): Promise<void> => {
    //@ts-ignore
    const userId = req.user.id;

    const { name, email, password, profileImage } = req.body;
    const data: any = {};
    if (name) data.name = name;
    if (email) data.email = email;
    if (profileImage) data.profileImage = profileImage;
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });
    res.status(200).json({ message: "Profile updated successfully.", user });
    return;
  }
);

export const getProfile = tryCatchHandler(
  async (req: Request, res: Response) => {
    //@ts-ignore
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        role: true,
        createdAt: true,
      },
    });
    res.status(200).json(user);
    return;
  }
);
