-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profilerImage" TEXT,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';
