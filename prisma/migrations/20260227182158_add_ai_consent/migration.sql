-- AlterTable
ALTER TABLE "Lecturer" ADD COLUMN     "aiConsentAt" TIMESTAMP(3),
ADD COLUMN     "aiConsentVersion" TEXT;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "aiConsentAt" TIMESTAMP(3),
ADD COLUMN     "aiConsentVersion" TEXT;
