/*
  Warnings:

  - Added the required column `searchVector` to the `FileContent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FileContent" ADD COLUMN     "searchVector" tsvector NOT NULL;

-- CreateIndex
CREATE INDEX "FileTag_tagId_fileId_idx" ON "FileTag"("tagId", "fileId");
