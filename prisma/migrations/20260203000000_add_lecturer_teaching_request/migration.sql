-- CreateEnum
CREATE TYPE "LecturerTeachingRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "LecturerTeachingRequest" (
    "id" TEXT NOT NULL,
    "lecturerId" TEXT NOT NULL,
    "courseOnSemesterId" TEXT NOT NULL,
    "status" "LecturerTeachingRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LecturerTeachingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LecturerTeachingRequest_lecturerId_courseOnSemesterId_key" ON "LecturerTeachingRequest"("lecturerId", "courseOnSemesterId");

-- AddForeignKey
ALTER TABLE "LecturerTeachingRequest" ADD CONSTRAINT "LecturerTeachingRequest_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES "Lecturer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LecturerTeachingRequest" ADD CONSTRAINT "LecturerTeachingRequest_courseOnSemesterId_fkey" FOREIGN KEY ("courseOnSemesterId") REFERENCES "CourseOnSemester"("id") ON DELETE CASCADE ON UPDATE CASCADE;
