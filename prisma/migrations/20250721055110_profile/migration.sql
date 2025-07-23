/*
  Warnings:

  - You are about to drop the column `profilerImage` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `File` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Workspace` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Workspace` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "File" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "profilerImage",
ADD COLUMN     "profileImage" TEXT,
ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "File_slug_key" ON "File"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_slug_key" ON "User"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_slug_key" ON "Workspace"("slug");
