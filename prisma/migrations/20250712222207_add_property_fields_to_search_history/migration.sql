-- AlterTable
ALTER TABLE "Property" ALTER COLUMN "currency" SET DEFAULT 'SAR';

-- AlterTable
ALTER TABLE "SearchHistory" ADD COLUMN     "propertyId" TEXT,
ADD COLUMN     "propertyName" TEXT;
