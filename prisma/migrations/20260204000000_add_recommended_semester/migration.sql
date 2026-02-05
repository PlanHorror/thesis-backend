-- AlterTable: add optional recommended semester (catalog hint), distinct from offering (CourseOnSemester)
ALTER TABLE "public"."Course" ADD COLUMN "recommendedSemester" TEXT;

-- Migrate existing data: copy semester to recommendedSemester when it was a real value
UPDATE "public"."Course"
SET "recommendedSemester" = "semester"
WHERE "semester" IS NOT NULL AND "semester" != 'Not specified';

-- Drop the old semester column
ALTER TABLE "public"."Course" DROP COLUMN "semester";
