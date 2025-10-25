/*
  Warnings:

  - A unique constraint covering the columns `[courseId,semesterId]` on the table `CourseOnSemester` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CourseOnSemester_courseId_semesterId_key" ON "public"."CourseOnSemester"("courseId", "semesterId");
