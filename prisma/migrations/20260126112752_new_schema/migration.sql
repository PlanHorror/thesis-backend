-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('INFO', 'WARNING', 'ALERT');

-- CreateEnum
CREATE TYPE "public"."ExamStatus" AS ENUM ('NOT_ELIGIBLE', 'ELIGIBLE', 'ABSENT', 'COMPLETED');

-- AlterTable
ALTER TABLE "public"."StudentCourseEnrollment" ADD COLUMN     "examStatus" "public"."ExamStatus" NOT NULL DEFAULT 'ELIGIBLE';

-- CreateTable
CREATE TABLE "public"."EnrollmentSession" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "semesterId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnrollmentSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExamSchedule" (
    "id" TEXT NOT NULL,
    "courseOnSemesterId" TEXT NOT NULL,
    "examDate" TEXT,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "location" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL DEFAULT 'INFO',
    "studentId" TEXT,
    "lecturerId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExamSchedule_courseOnSemesterId_key" ON "public"."ExamSchedule"("courseOnSemesterId");

-- AddForeignKey
ALTER TABLE "public"."EnrollmentSession" ADD CONSTRAINT "EnrollmentSession_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "public"."Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExamSchedule" ADD CONSTRAINT "ExamSchedule_courseOnSemesterId_fkey" FOREIGN KEY ("courseOnSemesterId") REFERENCES "public"."CourseOnSemester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES "public"."Lecturer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
