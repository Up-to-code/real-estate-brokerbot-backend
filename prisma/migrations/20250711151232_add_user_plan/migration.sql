-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "plan" "Plan" NOT NULL DEFAULT 'FREE';
