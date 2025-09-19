-- AlterTable
ALTER TABLE "public"."Admin" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."Student" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."Teacher" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;
