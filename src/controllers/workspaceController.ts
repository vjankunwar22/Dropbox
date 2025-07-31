import { tryCatchHandler } from "../lib/helpers";
import type { Request, Response } from "express";
import prisma from "../services/db.config";

export const createSpace = tryCatchHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { name } = req.body;
    //@ts-ignore

    const userId = req.user.id;

    if (!name) {
      res.status(400).json({ message: "Workspace name is required" });
      return;
    }
    const slug = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();

    const workspace = await prisma.workspace.create({
      data: {
        name,
        slug,
        createdBy: { connect: { id: userId } },
        updatedBy: { connect: { id: userId } },
        users: {
          create: {
            user: { connect: { id: userId } },
            role: "ADMIN",
            createdBy: { connect: { id: userId } },
            updatedBy: { connect: { id: userId } },
          },
        },
      },
      include: {
        users: {
          include: {
            user: true,
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE_WORKSPACE",
        entity: "Workspace",
        entityId: workspace.id,
        details: `Workspace '${name}' created`,
        createdBy: { connect: { id: userId } },
        updatedBy: { connect: { id: userId } },
      },
    });

    res.status(201).json({
      message: "Workspace created successfully",
      workspace,
    });
  }
);

export const inviteUserToWorkspace = tryCatchHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email, workspaceId } = req.body;
    //@ts-ignore
    const invitedById = req.user.id;

    if (!email || !workspaceId) {
      res.status(400).json({ message: "Email and workspaceId are required" });
      return;
    }

    // Check if workspace exists & user is ADMIN
    const workspaceUser = await prisma.workspaceUser.findFirst({
      where: {
        workspaceId,
        userId: invitedById,
        role: "ADMIN",
      },
    });

    if (!workspaceUser) {
      res
        .status(403)
        .json({ message: "Only admins can invite users to this workspace" });
      return;
    }

    // Check if email is already a member
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      const alreadyMember = await prisma.workspaceUser.findUnique({
        where: {
          userId_workspaceId: {
            userId: existingUser.id,
            workspaceId,
          },
        },
      });

      if (alreadyMember) {
        res
          .status(409)
          .json({ message: "User is already a member of this workspace" });
        return;
      }
    }

    // Create or update invitation
    const invitation = await prisma.invitation.create({
      data: {
        email,
        workspace: { connect: { id: workspaceId } },
        invitedBy: { connect: { id: invitedById } },
        createdBy: { connect: { id: invitedById } },
        updatedBy: { connect: { id: invitedById } },
        status: "PENDING",
      },
    });

    // (Optional: send email logic here)
    // await sendWorkspaceInviteEmail(email, workspaceId);

    res.status(201).json({
      message: "Invitation sent successfully",
      invitation,
    });
  }
);

export const respondToWorkspaceInvite = tryCatchHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { invitationId, action } = req.body;
    //@ts-ignore
    const userId = req.user.id; // logged-in user

    if (!invitationId || !["ACCEPTED", "DECLINED"].includes(action)) {
      res.status(400).json({ message: "Invalid invitationId or action" });
      return;
    }

    //  Check invitation
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      res.status(404).json({ message: "Invitation not found" });
      return;
    }

    if (invitation.status !== "PENDING") {
      res.status(409).json({ message: "Invitation already responded to" });
      return;
    }

    if (action === "ACCEPTED") {
      // Check if user is already a member
      const alreadyMember = await prisma.workspaceUser.findUnique({
        where: {
          userId_workspaceId: {
            userId,
            workspaceId: invitation.workspaceId,
          },
        },
      });

      if (!alreadyMember) {
        // Add user as a member of workspace
        await prisma.workspaceUser.create({
          data: {
            user: { connect: { id: userId } },
            workspace: { connect: { id: invitation.workspaceId } },
            role: "USER",
            createdBy: { connect: { id: userId } },
            updatedBy: { connect: { id: userId } },
          },
        });
      }

      // Update invitation status
      await prisma.invitation.update({
        where: { id: invitationId },
        data: {
          status: "ACCEPTED",
          acceptedAt: new Date(),
          updatedBy: { connect: { id: userId } },
        },
      });

      res
        .status(200)
        .json({ message: "You have joined the workspace successfully" });
    } else {
      //  Decline the invitation
      await prisma.invitation.update({
        where: { id: invitationId },
        data: {
          status: "DECLINED",
          updatedBy: { connect: { id: userId } },
        },
      });

      res.status(200).json({ message: "You have declined the invitation" });
    }
  }
);

export const getAllWorkspace = tryCatchHandler(
  async (req: Request, res: Response) => {
    const workspaces = await prisma.workspace.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        users: true,
        createdAt: true,
        createdBy: true,
      },
    });
    res.status(200).json(workspaces);
    return;
  }
);

export const deleteWorkspace = tryCatchHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    await prisma.file.deleteMany({ where: { workspaceId: id } });
    await prisma.invitation.deleteMany({ where: { workspaceId: id } });
    await prisma.workspaceUser.deleteMany({ where: { workspaceId: id } });

    await prisma.workspace.delete({ where: { id } });

    res.status(200).json({ message: "Workspace deleted successfully" });
  }
);

export const updateWorkspace = tryCatchHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, slug } = req.body;
    //@ts-ignore
    const currentUserId = req.user.id;

    if (!name || name.trim() === "") {
      res.status(400).json({ message: "Workspace name is required" });
      return;
    }

    const newSlug =
      slug || name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();

    const existingSlug = await prisma.workspace.findUnique({
      where: { slug: newSlug },
    });

    if (existingSlug && existingSlug.id !== id) {
      res.status(409).json({ message: "Slug already taken" });
      return;
    }

    const workspace = await prisma.workspace.update({
      where: { id: String(id) },
      data: {
        name,
        slug: newSlug,
        updatedBy: { connect: { id: currentUserId } },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE_WORKSPACE",
        entity: "Workspace",
        entityId: id,
        details: `Workspace updated to name: ${name}, slug: ${newSlug}`,
        createdBy: { connect: { id: currentUserId } },
        updatedBy: { connect: { id: currentUserId } },
      },
    });

    res.status(200).json({
      message: "Workspace updated successfully",
      workspace,
    });
  }
);


