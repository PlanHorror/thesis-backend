-- AlterTable
ALTER TABLE "public"."CourseOnSemester" ADD COLUMN     "dayOfWeek" INTEGER,
ADD COLUMN     "endTime" TEXT,
ADD COLUMN     "lecturerId" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "startTime" TEXT;

-- AddForeignKey
ALTER TABLE "public"."CourseOnSemester" ADD CONSTRAINT "CourseOnSemester_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES "public"."Lecturer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
