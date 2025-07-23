/*
  Warnings:

  - You are about to drop the column `slug` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_slug_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "slug";
