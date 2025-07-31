import prisma from "../services/db.config";

export const isOwnerOrAdmin = async (fileId: string, userId: string) => {
    const file = await prisma.file.findUnique({
      where: { id: fileId },
      select: { ownerId: true, workspaceId: true },
    });
    if (!file) return { allowed: false, reason: "NOT_FOUND" };
  
    if (file.ownerId === userId) return { allowed: true };
  
    const admin = await prisma.workspaceUser.findFirst({
      where: { workspaceId: file.workspaceId, userId, role: "ADMIN" },
      select: { id: true },
    });
    return { allowed: !!admin };
  };
  