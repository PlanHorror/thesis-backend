/*
  Warnings:

  - A unique constraint covering the columns `[path]` on the table `CourseDocument` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[headId]` on the table `Department` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[departmentId]` on the table `Department` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[lecturerId]` on the table `Lecturer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `departmentId` to the `Department` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lecturerId` to the `Lecturer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."CourseDocument" ALTER COLUMN "url" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Department" ADD COLUMN     "departmentId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Lecturer" ADD COLUMN     "lecturerId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CourseDocument_path_key" ON "public"."CourseDocument"("path");

-- CreateIndex
CREATE UNIQUE INDEX "Department_headId_key" ON "public"."Department"("headId");

-- CreateIndex
CREATE UNIQUE INDEX "Department_departmentId_key" ON "public"."Department"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Lecturer_lecturerId_key" ON "public"."Lecturer"("lecturerId");
