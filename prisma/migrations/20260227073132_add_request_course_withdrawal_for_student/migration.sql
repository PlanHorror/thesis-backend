-- CreateEnum
CREATE TYPE "CourseWithdrawalRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "CourseWithdrawalRequest" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "courseOnSemesterId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" "CourseWithdrawalRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseWithdrawalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CourseWithdrawalRequest_enrollmentId_key" ON "CourseWithdrawalRequest"("enrollmentId");

-- AddForeignKey
ALTER TABLE "CourseWithdrawalRequest" ADD CONSTRAINT "CourseWithdrawalRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseWithdrawalRequest" ADD CONSTRAINT "CourseWithdrawalRequest_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "StudentCourseEnrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
