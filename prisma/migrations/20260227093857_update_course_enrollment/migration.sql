-- DropForeignKey
ALTER TABLE "CourseWithdrawalRequest" DROP CONSTRAINT "CourseWithdrawalRequest_enrollmentId_fkey";

-- AlterTable
ALTER TABLE "CourseWithdrawalRequest" ADD COLUMN     "rejectionReason" TEXT,
ALTER COLUMN "enrollmentId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "LecturerTeachingRequest" ADD COLUMN     "rejectionReason" TEXT;

-- AlterTable
ALTER TABLE "ProfileUpdateRequest" ADD COLUMN     "rejectionReason" TEXT;

-- AddForeignKey
ALTER TABLE "CourseWithdrawalRequest" ADD CONSTRAINT "CourseWithdrawalRequest_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "StudentCourseEnrollment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseWithdrawalRequest" ADD CONSTRAINT "CourseWithdrawalRequest_courseOnSemesterId_fkey" FOREIGN KEY ("courseOnSemesterId") REFERENCES "CourseOnSemester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
