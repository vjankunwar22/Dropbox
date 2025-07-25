import { Request, NextFunction, Response } from "express";
import prisma from "../services/db.config";

export const isWorkspaceAdmin = 

async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params; // workspaceId from URL
    //@ts-ignore
    const userId = req.user.id; // logged-in user

    if (!id) {
      return res.status(400).json({ message: "WorkspaceId is required" });
    }

    // ✅ Check if workspace exists
    const workspace = await prisma.workspace.findUnique({
      where: { id: String(id) },
    });

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // ✅ Check if user is an ADMIN in this workspace
    const workspaceUser = await prisma.workspaceUser.findFirst({
      where: {
        workspaceId: id,
        userId,
        role: "ADMIN",
      },
    });

    if (!workspaceUser) {
      return res
        .status(403)
        .json({ message: "You are not an admin of this workspace" });
    }

    next();
  } catch (error) {
    console.error("isWorkspaceAdmin error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
