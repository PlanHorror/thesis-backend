-- CreateEnum
CREATE TYPE "ScheduleMode" AS ENUM ('ONLINE', 'ON_CAMPUS', 'HYBRID');

-- AlterTable
ALTER TABLE "CourseOnSemester" ADD COLUMN     "meetingUrl" TEXT,
ADD COLUMN     "mode" "ScheduleMode" NOT NULL DEFAULT 'ON_CAMPUS';

-- CreateTable
CREATE TABLE "ScheduleChange" (
    "id" TEXT NOT NULL,
    "courseOnSemesterId" TEXT NOT NULL,
    "changedBy" TEXT NOT NULL,
    "changeType" TEXT NOT NULL,
    "oldDayOfWeek" INTEGER,
    "newDayOfWeek" INTEGER,
    "oldStartTime" INTEGER,
    "newStartTime" INTEGER,
    "oldEndTime" INTEGER,
    "newEndTime" INTEGER,
    "oldLocation" TEXT,
    "newLocation" TEXT,
    "oldMode" TEXT,
    "newMode" TEXT,
    "oldMeetingUrl" TEXT,
    "newMeetingUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScheduleChange_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ScheduleChange" ADD CONSTRAINT "ScheduleChange_courseOnSemesterId_fkey" FOREIGN KEY ("courseOnSemesterId") REFERENCES "CourseOnSemester"("id") ON DELETE CASCADE ON UPDATE CASCADE;
