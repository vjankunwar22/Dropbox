-- AlterTable
ALTER TABLE "public"."FileContent" ADD COLUMN     "filePath" TEXT,
ADD COLUMN     "fileType" TEXT,
ALTER COLUMN "content" DROP NOT NULL;
