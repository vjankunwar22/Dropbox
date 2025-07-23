/*
  Warnings:

  - You are about to drop the `Invite` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Invite" DROP CONSTRAINT "Invite_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Invite" DROP CONSTRAINT "Invite_invitedById_fkey";

-- DropForeignKey
ALTER TABLE "Invite" DROP CONSTRAINT "Invite_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "Invite" DROP CONSTRAINT "Invite_workspaceId_fkey";

-- DropTable
DROP TABLE "Invite";

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "status" "InviteStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
