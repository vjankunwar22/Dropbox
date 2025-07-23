/*
  Warnings:

  - Added the required column `createdById` to the `AuditLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `AuditLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedById` to the `AuditLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedById` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `FileContent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `FileContent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedById` to the `FileContent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `FileShare` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedById` to the `FileShare` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `Invite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedById` to the `Invite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `Workspace` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedById` to the `Workspace` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `WorkspaceUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedById` to the `WorkspaceUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedById" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "updatedById" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FileContent" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedById" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FileShare" ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "updatedById" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Invite" ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "updatedById" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "updatedById" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "WorkspaceUser" ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "updatedById" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceUser" ADD CONSTRAINT "WorkspaceUser_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceUser" ADD CONSTRAINT "WorkspaceUser_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileShare" ADD CONSTRAINT "FileShare_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileShare" ADD CONSTRAINT "FileShare_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileContent" ADD CONSTRAINT "FileContent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileContent" ADD CONSTRAINT "FileContent_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
