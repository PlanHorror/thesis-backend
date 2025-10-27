-- AlterTable
ALTER TABLE "public"."CourseOnSemester" ADD COLUMN     "capacity" INTEGER,
ADD COLUMN     "isSummarized" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."StudentCourseEnrollment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseOnSemesterId" TEXT NOT NULL,
    "gradeType1" DOUBLE PRECISION,
    "gradeType2" DOUBLE PRECISION,
    "gradeType3" DOUBLE PRECISION,
    "finalGrade" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentCourseEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentCourseEnrollment_studentId_courseOnSemesterId_key" ON "public"."StudentCourseEnrollment"("studentId", "courseOnSemesterId");

-- AddForeignKey
ALTER TABLE "public"."StudentCourseEnrollment" ADD CONSTRAINT "StudentCourseEnrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentCourseEnrollment" ADD CONSTRAINT "StudentCourseEnrollment_courseOnSemesterId_fkey" FOREIGN KEY ("courseOnSemesterId") REFERENCES "public"."CourseOnSemester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
