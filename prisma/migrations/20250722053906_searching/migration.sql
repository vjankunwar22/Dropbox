/*
  Warnings:

  - You are about to drop the column `searchVector` on the `FileContent` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "FileTag_tagId_fileId_idx";

-- AlterTable
ALTER TABLE "FileContent" DROP COLUMN "searchVector";
