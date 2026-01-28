/*
  Warnings:

  - You are about to drop the column `courseId` on the `CourseDocument` table. All the data in the column will be lost.
  - Added the required column `courseOnSemesterId` to the `CourseDocument` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."CourseDocument" DROP CONSTRAINT "CourseDocument_courseId_fkey";

-- AlterTable
ALTER TABLE "public"."CourseDocument" DROP COLUMN "courseId",
ADD COLUMN     "courseOnSemesterId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."CourseDocument" ADD CONSTRAINT "CourseDocument_courseOnSemesterId_fkey" FOREIGN KEY ("courseOnSemesterId") REFERENCES "public"."CourseOnSemester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
