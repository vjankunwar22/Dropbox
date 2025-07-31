import { Request, Response } from "express";
import prisma from "../services/db.config";
import { tryCatchHandler } from "../lib/helpers";
import { file } from "zod";

export const createFile = tryCatchHandler(
  async (req: Request, res: Response): Promise<void> => {
    const {
      name,
      description,
      workspaceId,
      parentId,
      isFolder,
      content,
      isPublic,
    } = req.body;
    //@ts-ignore
    const userId = req.user.id;

    if (!name || !workspaceId) {
      res.status(400).json({ message: "Name and workspaceId are required" });
      return;
    }

    const workspaceUser = await prisma.workspaceUser.findFirst({
      where: { workspaceId, userId },
    });

    if (!workspaceUser) {
      res
        .status(403)
        .json({ message: "You are not a member of this workspace" });
      return;
    }
    const slug = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();

    // Create File record
    const file = await prisma.file.create({
      data: {
        name,
        description,
        slug,
        isFolder: isFolder ?? false,
        isPublic: isPublic ?? false,
        parent: parentId ? { connect: { id: parentId } } : undefined,
        workspace: { connect: { id: workspaceId } },
        owner: { connect: { id: userId } },
        createdBy: { connect: { id: userId } },
        updatedBy: { connect: { id: userId } },
      },
    });

    // If it's a file (not folder), add content (optional)
    if (!isFolder && content) {
      await prisma.fileContent.create({
        data: {
          file: { connect: { id: file.id } },
          content,
          createdBy: { connect: { id: userId } },
          updatedBy: { connect: { id: userId } },
        },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "CREATE_FILE",
        entity: "File",
        entityId: file.id,
        details: `File '${name}' created in workspace ${workspaceId}`,
        createdBy: { connect: { id: userId } },
        updatedBy: { connect: { id: userId } },
      },
    });

    res.status(201).json({
      message: isFolder
        ? "Folder created successfully"
        : "File created successfully",
      file,
    });
  }
);

export const getWorkspaceFiles = tryCatchHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { workspaceId } = req.params;
    //@ts-ignore
    const userId = req.user.id;

    if (!workspaceId) {
      res.status(400).json({ message: "WorkspaceId is required" });
      return;
    }

    // Check if user is a member of the workspace
    const isMember = await prisma.workspaceUser.findFirst({
      where: { workspaceId, userId },
    });

    if (!isMember) {
      res
        .status(403)
        .json({ message: "You are not a member of this workspace" });
      return;
    }

    // Get all files (including folders & children)
    const files = await prisma.file.findMany({
      where: { workspaceId },
      include: {
        children: true,
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    res.status(200).json({
      message: "Workspace files fetched successfully",
      files,
    });
  }
);

export const deleteFile = tryCatchHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { fileId } = req.params;
      // @ts-ignore
      const userId: string = req.user.id;
  
      const root = await prisma.file.findUnique({
        where: { id: fileId },
        select: { id: true, isFolder: true, workspaceId: true, ownerId: true },
      });
      if (!root) {
        res.status(404).json({ message: "File not found" });
        return;
      }
  
      // permission: owner or workspace ADMIN
      const isOwner = root.ownerId === userId;
      const isWorkspaceAdmin = !!(await prisma.workspaceUser.findFirst({
        where: { workspaceId: root.workspaceId, userId, role: "ADMIN" },
        select: { id: true },
      }));
      if (!(isOwner || isWorkspaceAdmin)) {
        res.status(403).json({ message: "Only owner or workspace admin can delete" });
        return;
      }
  
      // Collect all descendant IDs (BFS)
      const allIds: string[] = [];
      const queue: string[] = [root.id];
      while (queue.length) {
        const curId = queue.shift()!;
        allIds.push(curId);
        const children = await prisma.file.findMany({
          where: { parentId: curId },
          select: { id: true },
        });
        for (const c of children) queue.push(c.id);
      }
  
      await prisma.$transaction([
        prisma.fileShare.deleteMany({ where: { fileId: { in: allIds } } }),
        prisma.fileContent.deleteMany({ where: { fileId: { in: allIds } } }),
        prisma.file.deleteMany({ where: { id: { in: allIds } } }),
        prisma.auditLog.create({
          data: {
            action: "DELETE_FILE",
            entity: "File",
            entityId: fileId,
            details: `Deleted ${allIds.length} item(s)`,
            createdBy: { connect: { id: userId } },
            updatedBy: { connect: { id: userId } },
          },
        }),
      ]);
  
      res.status(200).json({ message: "File/folder deleted successfully" });
    }
  );
  

export const getAllFiles = tryCatchHandler(
  async (req: Request, res: Response) => {
    const files = await prisma.file.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        isFolder: true, // will always be false due to filter
        isPublic: true,
        workspaceId: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,
        owner: { select: { id: true, email: true, name: true } },
        workspace: { select: { id: true, name: true, slug: true } },
      },
    });
    res.status(200).json(files);
    return;
  }
);

export const getFileContent = tryCatchHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { fileId } = req.params;
    // @ts-ignore
    const userId: string = req.user.id;

    const file = await prisma.file.findUnique({
      where: { id: fileId },
      include: {
        workspace: { select: { id: true } },
        shares: { select: { userId: true } },
        owner: { select: { id: true } },
        content: true,
      },
    });

    if (!file) {
      res.status(404).json({ message: "File not found" });
      return;
    }
    if (file.isFolder) {
      res.status(400).json({ message: "Folders do not have content" });
      return;
    }

    // Check access
    const isOwner = file.owner.id === userId;
    const isShared = file.shares.some((s) => s.userId === userId);
    const isWorkspaceAdmin = !!(await prisma.workspaceUser.findFirst({
      where: { workspaceId: file.workspaceId, userId, role: "ADMIN" },
      select: { id: true },
    }));

    if (!(file.isPublic || isOwner || isShared || isWorkspaceAdmin)) {
      res.status(403).json({ message: "You do not have access to this file" });
      return;
    }

    res.status(200).json({
      message: "Content fetched",
      fileId: file.id,
      name: file.name,
      content: file.content?.content ?? "",
      updatedAt: file.content?.updatedAt ?? file.updatedAt,
    });
  }
);


export const updateFile = tryCatchHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { fileId } = req.params;
      const { name, description, isPublic, parentId } = req.body;
      // @ts-ignore
      const userId: string = req.user.id;
  
      const file = await prisma.file.findUnique({
        where: { id: fileId },
        include: {
          workspace: { select: { id: true } },
          owner: { select: { id: true } },
        },
      });
      if (!file) {
        res.status(404).json({ message: "File not found" });
        return;
      }
  
      // permission: owner or workspace ADMIN
      const isOwner = file.ownerId === userId;
      const isWorkspaceAdmin = !!(await prisma.workspaceUser.findFirst({
        where: { workspaceId: file.workspaceId, userId, role: "ADMIN" },
        select: { id: true },
      }));
      if (!(isOwner || isWorkspaceAdmin)) {
        res.status(403).json({ message: "Only owner or workspace admin can update" });
        return;
      }
  
      // If moving under a parent, validate same workspace and parent is a folder
      if (typeof parentId !== "undefined" && parentId !== null) {
        if (parentId === fileId) {
          res.status(400).json({ message: "A file cannot be its own parent" });
          return;
        }
        const parent = await prisma.file.findUnique({
          where: { id: parentId },
          select: { id: true, isFolder: true, workspaceId: true },
        });
        if (!parent) {
          res.status(404).json({ message: "Parent folder not found" });
          return;
        }
        if (!parent.isFolder) {
          res.status(400).json({ message: "Parent must be a folder" });
          return;
        }
        if (parent.workspaceId !== file.workspaceId) {
          res.status(400).json({ message: "Parent must be in same workspace" });
          return;
        }
        // Optional: prevent cycles by ensuring parent isn't a descendant of file (left as exercise)
      }
  
      const updated = await prisma.file.update({
        where: { id: fileId },
        data: {
          name: typeof name === "string" && name.trim() ? name : undefined,
          description: typeof description === "string" ? description : undefined,
          isPublic: typeof isPublic === "boolean" ? isPublic : undefined,
          parent: typeof parentId === "undefined" ? undefined : parentId === null ? { disconnect: true } : { connect: { id: parentId } },
          updatedBy: { connect: { id: userId } },
        },
      });
  
      await prisma.auditLog.create({
        data: {
          action: "UPDATE_FILE",
          entity: "File",
          entityId: fileId,
          details: `Updated fields: ${[
            typeof name !== "undefined" ? "name" : null,
            typeof description !== "undefined" ? "description" : null,
            typeof isPublic !== "undefined" ? "isPublic" : null,
            typeof parentId !== "undefined" ? "parentId" : null,
          ]
            .filter(Boolean)
            .join(", ")}`,
          createdBy: { connect: { id: userId } },
          updatedBy: { connect: { id: userId } },
        },
      });
  
      res.status(200).json({ message: "File updated successfully", file: updated });
    }
  );

  export const shareFile = tryCatchHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { fileId } = req.params;
      const { userIds } = req.body as { userIds: string[] }; // desired share list
      // @ts-ignore
      const operatorId: string = req.user.id;
  
      if (!Array.isArray(userIds)) {
        res.status(400).json({ message: "userIds array is required" });
        return;
      }
  
      const file = await prisma.file.findUnique({
        where: { id: fileId },
        include: { workspace: true, owner: true, shares: true },
      });
      if (!file) {
        res.status(404).json({ message: "File not found" });
        return;
      }
  
      // permission: owner or workspace ADMIN
      const isOwner = file.ownerId === operatorId;
      const isWorkspaceAdmin = !!(await prisma.workspaceUser.findFirst({
        where: { workspaceId: file.workspaceId, userId: operatorId, role: "ADMIN" },
        select: { id: true },
      }));
      if (!(isOwner || isWorkspaceAdmin)) {
        res.status(403).json({ message: "Only owner or workspace admin can share" });
        return;
      }
  
      // Ensure all target users are members of the workspace
      const members = await prisma.workspaceUser.findMany({
        where: { workspaceId: file.workspaceId, userId: { in: userIds } },
        select: { userId: true },
      });
      const memberIds = new Set(members.map((m) => m.userId));
      const nonMembers = userIds.filter((id) => !memberIds.has(id));
      if (nonMembers.length > 0) {
        res.status(400).json({
          message: "All users must be members of the workspace",
          nonMembers,
        });
        return;
      }
  
      const currentShareIds = new Set(file.shares.map((s) => s.userId));
      const desiredShareIds = new Set(userIds);
  
      const toAdd = [...desiredShareIds].filter((id) => !currentShareIds.has(id));
      const toRemove = [...currentShareIds].filter((id) => !desiredShareIds.has(id));
  
      await prisma.$transaction([
        // add
        ...toAdd.map((uId) =>
          prisma.fileShare.create({
            data: {
              file: { connect: { id: file.id } },
              user: { connect: { id: uId } },
              createdBy: { connect: { id: operatorId } },
              updatedBy: { connect: { id: operatorId } },
            },
          })
        ),
        // remove
        prisma.fileShare.deleteMany({
          where: { fileId: file.id, userId: { in: toRemove } },
        }),
        prisma.auditLog.create({
          data: {
            action: "SHARE_FILE",
            entity: "File",
            entityId: file.id,
            details: `Added: ${toAdd.length}, Removed: ${toRemove.length}`,
            createdBy: { connect: { id: operatorId } },
            updatedBy: { connect: { id: operatorId } },
          },
        }),
      ]);
  
      // Return fresh shares
      const updatedShares = await prisma.fileShare.findMany({
        where: { fileId: file.id },
        select: { user: { select: { id: true, email: true, name: true } } },
      });
  
      res.status(200).json({
        message: "Shares updated",
        added: toAdd,
        removed: toRemove,
        shares: updatedShares.map((s) => s.user),
      });
    }
  );
  
  
